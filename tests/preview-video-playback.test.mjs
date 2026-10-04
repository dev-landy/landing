import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const appPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../assets/app.js",
);
const appScript = readFileSync(appPath, "utf8");

function loadApp({ reduceMotion = false, rejectPlayback = false } = {}) {
  const observers = [];
  const calls = { load: 0, play: 0, playbackCatch: 0 };
  const source = {
    dataset: { src: "assets/preview.mov" },
    removeAttribute(name) {
      if (name === "data-src") delete this.dataset.src;
    },
  };
  const video = {
    dataset: {},
    querySelectorAll(selector) {
      return selector === "source[data-src]" && source.dataset.src ? [source] : [];
    },
    load() {
      calls.load += 1;
    },
    play() {
      calls.play += 1;
      const attempt = rejectPlayback
        ? Promise.reject(new Error("Autoplay denied"))
        : Promise.resolve();
      const catchPlayback = attempt.catch.bind(attempt);
      attempt.catch = (handler) => {
        calls.playbackCatch += 1;
        return catchPlayback(handler);
      };
      return attempt;
    },
  };

  class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
      this.observed = [];
      this.unobserved = [];
      observers.push(this);
    }

    observe(target) {
      this.observed.push(target);
    }

    unobserve(target) {
      this.unobserved.push(target);
    }

    emit(isIntersecting) {
      this.callback([{ isIntersecting, target: video }], this);
    }
  }

  const document = {
    getElementById: () => null,
    querySelectorAll: (selector) =>
      selector === "video[data-lazy-video]" ? [video] : [],
  };
  const window = {
    IntersectionObserver,
    location: { search: "" },
    matchMedia: () => ({ matches: reduceMotion }),
  };
  const context = vm.createContext({
    document,
    IntersectionObserver,
    URLSearchParams,
    window,
  });

  vm.runInContext(appScript, context, { filename: appPath });

  return { calls, context, observer: observers[0], source, video };
}

test("offscreen preview videos retain their lazy sources without loading or playing", () => {
  const { calls, observer, source, video } = loadApp();

  assert.deepEqual(observer.observed, [video]);
  observer.emit(false);

  assert.equal(source.src, undefined);
  assert.equal(source.dataset.src, "assets/preview.mov");
  assert.equal(calls.load, 0);
  assert.equal(calls.play, 0);
  assert.deepEqual(observer.unobserved, []);
});

test("intersecting preview videos attach their source and begin playback once", () => {
  const { calls, observer, source, video } = loadApp();

  observer.emit(true);

  assert.equal(source.src, "assets/preview.mov");
  assert.equal(source.dataset.src, undefined);
  assert.equal(calls.load, 1);
  assert.equal(calls.play, 1);
  assert.deepEqual(observer.unobserved, [video]);
});

test("reduced motion loads the video for user playback without playing automatically", async () => {
  const { calls, observer, source, video } = loadApp({ reduceMotion: true });

  observer.emit(true);

  assert.equal(source.src, "assets/preview.mov");
  assert.equal(source.dataset.src, undefined);
  assert.equal(calls.load, 1);
  assert.equal(calls.play, 0);
  assert.deepEqual(observer.unobserved, [video]);

  await video.play();
  assert.equal(calls.play, 1);
});

test("repeated intersection callbacks and loads do not reload or restart a video", () => {
  const { calls, context, observer, video } = loadApp();

  observer.emit(true);
  observer.emit(true);
  context.loadPreviewVideo(video);
  context.loadPreviewVideo(video);

  assert.equal(calls.load, 1);
  assert.equal(calls.play, 1);
});

test("denied autoplay is handled while keeping the loaded source available", async () => {
  const { calls, observer, source, video } = loadApp({ rejectPlayback: true });

  assert.doesNotThrow(() => observer.emit(true));
  await new Promise(setImmediate);

  assert.equal(calls.playbackCatch, 1);
  assert.equal(source.src, "assets/preview.mov");
  assert.equal(calls.load, 1);
  assert.equal(calls.play, 1);
  assert.deepEqual(observer.unobserved, [video]);
});
