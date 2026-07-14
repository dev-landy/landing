import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const featurePages = [
  "features/rent-collection.html",
  "features/small-landlord-app.html",
  "features/contract-expiry.html",
  "features/overdue-notice.html",
];

test("released feature pages wire hero and bottom store CTAs to analytics", () => {
  for (const relativePath of featurePages) {
    const html = readFileSync(resolve(root, relativePath), "utf8");
    const trackedAnchors = [...html.matchAll(/<a\b[^>]*data-beta-location="([^"]+)"[^>]*>/g)];

    assert.match(html, /src="\.\.\/assets\/analytics\.js"/);
    assert.match(html, /src="\.\.\/assets\/amplitude\.js"/);
    assert.match(html, /src="\.\.\/assets\/app\.js" defer/);
    assert.deepEqual(
      trackedAnchors.map((match) => match[1]),
      ["hero", "feature_bottom"],
      relativePath,
    );
    assert.doesNotMatch(
      html.match(/<nav\b[\s\S]*?<\/nav>/)?.[0] || "",
      /data-beta-location/,
    );
  }
});

test("shared click handler emits GA and Amplitude store events", () => {
  let clickHandler;
  const gtagCalls = [];
  const amplitudeCalls = [];
  const link = {
    dataset: { betaLocation: "hero" },
    classList: { contains: () => false },
    getAttribute: (name) =>
      name === "href"
        ? "https://play.google.com/store/apps/details?id=com.landy.app"
        : null,
    addEventListener: (name, handler) => {
      if (name === "click") clickHandler = handler;
    },
  };
  const document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: (selector) =>
      selector === "[data-beta-location]" ? [link] : [],
  };
  const window = {
    addEventListener() {},
    document,
    innerHeight: 800,
    location: { search: "" },
    matchMedia: () => ({ matches: false }),
    trackAmplitude: (...args) => amplitudeCalls.push(args),
  };
  const context = {
    cancelAnimationFrame() {},
    clearTimeout() {},
    document,
    gtag: (...args) => gtagCalls.push(args),
    performance: { now: () => 0 },
    requestAnimationFrame: () => 0,
    setTimeout: () => 0,
    URLSearchParams,
    window,
  };
  context.globalThis = context;

  vm.runInContext(
    readFileSync(resolve(root, "assets/app.js"), "utf8"),
    vm.createContext(context),
  );
  clickHandler();

  assert.ok(
    gtagCalls.some(
      ([command, eventName]) =>
        command === "event" && eventName === "beta_apply_click",
    ),
  );
  assert.deepEqual(JSON.parse(JSON.stringify(amplitudeCalls)), [
    ["google_play_click", { button_location: "hero", source: "rent" }],
  ]);
});
