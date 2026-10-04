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

function createFlow() {
  const classes = new Set();
  const classChanges = [];

  return {
    classes,
    classChanges,
    dataset: {},
    offsetWidth: 340,
    classList: {
      add(name) {
        classChanges.push(["add", name]);
        classes.add(name);
      },
      remove(name) {
        classChanges.push(["remove", name]);
        classes.delete(name);
      },
    },
  };
}

function loadApp({ flowCount = 1, supportsIntersectionObserver = true } = {}) {
  const flows = Array.from({ length: flowCount }, createFlow);
  const observers = [];
  const timers = [];

  class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
      this.observed = [];
      this.disconnected = false;
      observers.push(this);
    }

    observe(element) {
      this.observed.push(element);
    }

    disconnect() {
      this.disconnected = true;
    }

    emit(isIntersecting) {
      this.callback(
        this.observed.map((target) => ({ isIntersecting, target })),
        this,
      );
    }
  }

  const document = {
    getElementById: () => null,
    querySelectorAll: (selector) =>
      selector === "[data-notification-flow]" ? flows : [],
  };
  const window = {
    location: { search: "" },
    matchMedia: () => ({ matches: false }),
  };
  if (supportsIntersectionObserver) {
    window.IntersectionObserver = IntersectionObserver;
  }

  const context = vm.createContext({
    document,
    IntersectionObserver,
    setInterval(callback, delay) {
      timers.push({ callback, delay, type: "interval" });
      return timers.length;
    },
    setTimeout(callback, delay) {
      timers.push({ callback, delay, type: "timeout" });
      return timers.length;
    },
    URLSearchParams,
    window,
  });

  vm.runInContext(appScript, context, { filename: appPath });

  return { context, flows, observers, timers };
}

test("notification demonstration starts only after entering the viewport", () => {
  const { flows: [flow], observers: [observer], timers } = loadApp();

  assert.deepEqual(observer.observed, [flow]);
  assert.equal(flow.classes.has("flow-running"), false);
  observer.emit(false);
  assert.equal(flow.classes.has("flow-running"), false);
  assert.equal(observer.disconnected, false);

  observer.emit(true);
  assert.equal(flow.classes.has("flow-running"), true);
  assert.equal(observer.disconnected, true);
  assert.equal(timers.length, 0);
});

test("repeated starts retain the completed demonstration without scheduling a replay", () => {
  const { context, flows: [flow], observers: [observer], timers } = loadApp();

  observer.emit(true);
  observer.emit(true);
  context.startNotificationFlow(flow);
  context.startNotificationFlow(flow);

  assert.deepEqual(flow.classChanges, [["add", "flow-running"]]);
  assert.equal(flow.classes.has("flow-running"), true);
  assert.equal(timers.length, 0, "notification demonstration must not replay on a timer");
});

test("each notification demonstration starts independently", () => {
  const { flows, observers, timers } = loadApp({ flowCount: 2 });

  observers[0].emit(true);
  assert.equal(flows[0].classes.has("flow-running"), true);
  assert.equal(flows[1].classes.has("flow-running"), false);
  assert.equal(observers[1].disconnected, false);

  observers[1].emit(true);
  assert.equal(flows[1].classes.has("flow-running"), true);
  assert.equal(timers.length, 0);
});

test("browsers without IntersectionObserver show the demonstration once immediately", () => {
  const { context, flows: [flow], observers, timers } = loadApp({
    supportsIntersectionObserver: false,
  });

  assert.equal(observers.length, 0);
  assert.equal(flow.classes.has("flow-running"), true);
  context.startNotificationFlow(flow);
  assert.deepEqual(flow.classChanges, [["add", "flow-running"]]);
  assert.equal(timers.length, 0);
});
