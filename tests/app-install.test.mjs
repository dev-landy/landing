import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const scriptPath = resolve(root, "assets/app-install.js");
const playUrl = "https://play.google.com/store/apps/details?id=com.landy.app";
const releasedPages = [
  "index.html",
  "features/rent-collection.html",
  "features/room-management.html",
  "features/contract-expiry.html",
  "features/overdue-notice.html",
];

function deferred() {
  let resolvePromise;
  let rejectPromise;
  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  return { promise, resolve: resolvePromise, reject: rejectPromise };
}

function loadAppInstall() {
  const listeners = { window: new Map(), document: new Map() };
  const navigations = [];

  function addEventListener(surface, name, listener) {
    const handlers = listeners[surface].get(name) || [];
    handlers.push(listener);
    listeners[surface].set(name, handlers);
  }

  class Element {
    constructor(store = "google-play") {
      this.dataset = { store };
      this.href = store === "google-play"
        ? playUrl
        : "https://apps.apple.com/kr/app/id6804934479";
    }

    closest(selector) {
      return selector === 'a[data-store="google-play"]' &&
        this.dataset.store === "google-play"
        ? this
        : null;
    }
  }

  const document = {
    addEventListener(name, listener) {
      addEventListener("document", name, listener);
    },
  };
  const window = {
    addEventListener(name, listener) {
      addEventListener("window", name, listener);
    },
    document,
    location: {
      assign(url) {
        navigations.push(url);
      },
    },
  };

  vm.runInContext(
    readFileSync(scriptPath, "utf8"),
    vm.createContext({ document, window, Element }),
    { filename: scriptPath },
  );

  function dispatch(surface, name, event) {
    return Promise.all(
      (listeners[surface].get(name) || []).map((listener) => listener(event)),
    );
  }

  function createPrompt({
    platforms = ["play"],
    prompt = () => Promise.resolve(),
    userChoice = Promise.resolve({ outcome: "accepted", platform: "play" }),
  } = {}) {
    const event = {
      platforms,
      promptCalls: 0,
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
      prompt() {
        this.promptCalls += 1;
        return prompt();
      },
      userChoice,
    };
    return event;
  }

  function click({ store = "google-play", nested = false, ...overrides } = {}) {
    const link = new Element(store);
    const target = nested ? new Element(store) : link;
    if (nested) target.closest = (selector) => link.closest(selector);
    const event = {
      target,
      button: 0,
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
      ...overrides,
    };
    return { event, completion: dispatch("document", "click", event) };
  }

  return {
    click,
    createPrompt,
    navigations,
    offerPrompt(event) {
      return dispatch("window", "beforeinstallprompt", event);
    },
    appInstalled() {
      return dispatch("window", "appinstalled", {});
    },
  };
}

test("Google Play links retain normal navigation when no native prompt is available", async () => {
  const app = loadAppInstall();
  const { event, completion } = app.click();
  await completion;

  assert.equal(event.defaultPrevented, false);
  assert.deepEqual(app.navigations, []);
});

test("web-only and malformed install events are ignored without suppressing links", async () => {
  for (const platforms of [["web"], [], undefined, "play", { 0: "play" }]) {
    const app = loadAppInstall();
    const prompt = app.createPrompt();
    prompt.platforms = platforms;
    await app.offerPrompt(prompt);
    const { event, completion } = app.click();
    await completion;

    assert.equal(prompt.defaultPrevented, false);
    assert.equal(prompt.promptCalls, 0);
    assert.equal(event.defaultPrevented, false);
    assert.deepEqual(app.navigations, []);
  }
});

test("a Play prompt starts during the click and is consumed exactly once", async () => {
  const app = loadAppInstall();
  const choice = deferred();
  const prompt = app.createPrompt({
    platforms: ["web", "play"],
    userChoice: choice.promise,
  });
  await app.offerPrompt(prompt);

  const first = app.click({ nested: true });
  assert.equal(prompt.defaultPrevented, true);
  assert.equal(first.event.defaultPrevented, true);
  assert.equal(prompt.promptCalls, 1, "prompt() must run before the click handler yields");

  choice.resolve({ outcome: "accepted", platform: "play" });
  await first.completion;
  const second = app.click();
  await second.completion;

  assert.equal(second.event.defaultPrevented, false);
  assert.equal(prompt.promptCalls, 1);
  assert.deepEqual(app.navigations, []);
});

test("dismissing a native prompt does not send the user to Google Play", async () => {
  const app = loadAppInstall();
  const prompt = app.createPrompt({
    userChoice: Promise.resolve({ outcome: "dismissed", platform: "" }),
  });
  await app.offerPrompt(prompt);
  const { event, completion } = app.click();
  await completion;

  assert.equal(event.defaultPrevented, true);
  assert.equal(prompt.promptCalls, 1);
  assert.deepEqual(app.navigations, []);
  const retry = app.click();
  await retry.completion;
  assert.equal(retry.event.defaultPrevented, false);
});

test("prompt failures use the existing Google Play link as the fallback", async () => {
  for (const promptFunction of [
    () => { throw new Error("native prompt unavailable"); },
    () => Promise.reject(new Error("native prompt unavailable")),
  ]) {
    const app = loadAppInstall();
    const prompt = app.createPrompt({ prompt: promptFunction });
    await app.offerPrompt(prompt);
    const { event, completion } = app.click();
    await completion;

    assert.equal(event.defaultPrevented, true);
    assert.equal(prompt.promptCalls, 1);
    assert.deepEqual(app.navigations, [playUrl]);
  }
});

test("a rejected user choice falls back to the store and releases the click guard", async () => {
  const app = loadAppInstall();
  const choice = deferred();
  await app.offerPrompt(app.createPrompt({ userChoice: choice.promise }));
  const first = app.click();
  choice.reject(new Error("choice unavailable"));
  await first.completion;

  assert.deepEqual(app.navigations, [playUrl]);
  const second = app.click();
  await second.completion;
  assert.equal(second.event.defaultPrevented, false);
});

test("repeated Play clicks while the native prompt is open are suppressed", async () => {
  const app = loadAppInstall();
  const choice = deferred();
  const prompt = app.createPrompt({ userChoice: choice.promise });
  await app.offerPrompt(prompt);
  const first = app.click();
  const second = app.click();
  await second.completion;

  assert.equal(first.event.defaultPrevented, true);
  assert.equal(second.event.defaultPrevented, true);
  assert.equal(prompt.promptCalls, 1);
  assert.deepEqual(app.navigations, []);

  choice.resolve({ outcome: "dismissed", platform: "" });
  await first.completion;
});

test("modified, non-primary, and other store clicks preserve their original behavior", async () => {
  const app = loadAppInstall();
  const prompt = app.createPrompt();
  await app.offerPrompt(prompt);
  for (const options of [
    { ctrlKey: true },
    { metaKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 },
    { button: 2 },
    { store: "app-store" },
    { target: null },
  ]) {
    const { event, completion } = app.click(options);
    await completion;
    assert.equal(event.defaultPrevented, false);
  }
  const alreadyHandled = app.click({ defaultPrevented: true });
  await alreadyHandled.completion;

  assert.equal(prompt.promptCalls, 0);
  assert.deepEqual(app.navigations, []);
  const ordinary = app.click();
  await ordinary.completion;
  assert.equal(ordinary.event.defaultPrevented, true);
  assert.equal(prompt.promptCalls, 1, "ignored clicks must leave the prompt available");
});

test("appinstalled clears an unused native prompt", async () => {
  const app = loadAppInstall();
  const prompt = app.createPrompt();
  await app.offerPrompt(prompt);
  await app.appInstalled();
  const { event, completion } = app.click();
  await completion;

  assert.equal(event.defaultPrevented, false);
  assert.equal(prompt.promptCalls, 0);
  assert.deepEqual(app.navigations, []);
});

test("install events received before the store links exist remain usable", async () => {
  const app = loadAppInstall();
  const prompt = app.createPrompt();
  await app.offerPrompt(prompt);
  // The harness creates each link only when clicked, after the event was received.
  const { event, completion } = app.click();
  await completion;

  assert.equal(event.defaultPrevented, true);
  assert.equal(prompt.promptCalls, 1);
});

const attributeValue = (tag, attribute) =>
  tag.match(new RegExp(`\\b${attribute}=["']([^"']*)["']`, "i"))?.[1];

test("released pages declare one basic Apple banner and load the native install setup in the head", () => {
  for (const relativePath of releasedPages) {
    const html = readFileSync(resolve(root, relativePath), "utf8");
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
    assert.ok(head, relativePath);
    const appleTags = [...head.matchAll(/<meta\b[^>]*>/gi)]
      .map(([tag]) => tag)
      .filter((tag) => attributeValue(tag, "name") === "apple-itunes-app");
    assert.equal(appleTags.length, 1, relativePath);
    assert.equal(attributeValue(appleTags[0], "content"), "app-id=6804934479", relativePath);
    const manifestTags = [...head.matchAll(/<link\b[^>]*>/gi)]
      .map(([tag]) => tag)
      .filter((tag) => attributeValue(tag, "rel") === "manifest");
    assert.equal(manifestTags.length, 1, relativePath);
    assert.equal(attributeValue(manifestTags[0], "href"), "/manifest.webmanifest", relativePath);
    const scripts = [...head.matchAll(/<script\b[^>]*>/gi)]
      .map(([tag]) => tag)
      .filter((tag) => attributeValue(tag, "src") === "/assets/app-install.js");
    assert.equal(scripts.length, 1, relativePath);
  }
});

test("legal and unreleased feature pages do not promote the native app installation", () => {
  for (const relativePath of [
    "legal/privacy-policy.html",
    "legal/data-deletion.html",
    "features/move-out-dispute.html",
    "features/tenant-inquiry-response.html",
  ]) {
    const html = readFileSync(resolve(root, relativePath), "utf8");
    assert.doesNotMatch(html, /apple-itunes-app|manifest\.webmanifest|app-install\.js/, relativePath);
  }
});

test("the browser manifest prefers the existing Play app and provides valid PNG icons", () => {
  const manifest = JSON.parse(readFileSync(resolve(root, "manifest.webmanifest"), "utf8"));
  assert.equal(manifest.name, "랜디");
  assert.equal(manifest.short_name, "랜디");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.display, "browser");
  assert.equal(manifest.prefer_related_applications, true);
  assert.deepEqual(manifest.related_applications, [{
    platform: "play",
    id: "com.landy.app",
    url: playUrl,
  }]);
  for (const size of [192, 512]) {
    const icon = manifest.icons.find((entry) => entry.sizes === `${size}x${size}`);
    assert.ok(icon, `expected ${size}x${size} icon`);
    assert.equal(icon.type, "image/png");
    assert.equal(icon.src, `/assets/app-icon-${size}.png`);
    const png = readFileSync(resolve(root, icon.src.slice(1)));
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
});
