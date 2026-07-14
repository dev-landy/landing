import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const stylesPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../assets/styles.css",
);
const styles = readFileSync(stylesPath, "utf8");

function getRuleBodies(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = [
    ...styles.matchAll(
      new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, "gs"),
    ),
  ];

  assert.ok(matches.length > 0, `expected ${selector} rule`);
  return matches.map((match) => match[1]);
}

function getRuleBody(selector) {
  return getRuleBodies(selector)[0];
}

test("floating Google Play button remains fixed to the viewport", () => {
  assert.doesNotMatch(getRuleBody(".google-play-button"), /position:/);
  assert.match(getRuleBody(".floating-store-badge"), /position:\s*fixed;/);
});

test("Google Play badge image keeps rounded corners in the mobile layout", () => {
  assert.match(
    getRuleBody(".google-play-button img"),
    /border-radius:\s*inherit;/,
  );
});

test("mobile floating button preserves the badge-sized component layout", () => {
  const floatingCtaRules = getRuleBodies(".floating-beta-cta");
  const floatingBadgeRule = getRuleBody(".floating-store-badge");
  const mobileRule = floatingCtaRules.at(-1);

  assert.match(floatingBadgeRule, /width:\s*168px;/);
  assert.match(floatingBadgeRule, /height:\s*50px;/);
  assert.match(
    mobileRule,
    /bottom:\s*calc\(14px \+ env\(safe-area-inset-bottom\)\);/,
  );
  assert.doesNotMatch(
    mobileRule,
    /(?:right|left|width|min-height|padding|font-size|transform):/,
  );
  assert.equal(getRuleBodies(".floating-beta-cta.is-visible").length, 1);
  assert.equal(getRuleBodies(".floating-beta-cta:hover").length, 1);
});
