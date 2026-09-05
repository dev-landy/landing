import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const styles = readFileSync(resolve(root, "assets/styles.css"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");

test("both floating store links stay inside one viewport-fixed container", () => {
  const floating = html.match(/<aside\b[^>]*class="floating-beta-cta"[^>]*>([\s\S]*?)<\/aside>/)?.[1];
  assert.ok(floating);
  assert.equal([...floating.matchAll(/<a\b/g)].length, 2);
  assert.match(floating, /data-store="app-store"/);
  assert.match(floating, /data-store="google-play"/);
  const containerRule = styles.match(/\.floating-beta-cta\s*\{([^}]*)\}/)?.[1];
  assert.match(containerRule, /position:\s*fixed;/);
  assert.match(containerRule, /env\(safe-area-inset-bottom\)/);
});

test("hidden floating links are hidden from keyboard navigation as well", () => {
  const hiddenRule = styles.match(/\.floating-beta-cta\s*\{([^}]*)\}/)?.[1];
  const visibleRule = styles.match(/\.floating-beta-cta\.is-visible\s*\{([^}]*)\}/)?.[1];
  assert.match(hiddenRule, /visibility:\s*hidden;/);
  assert.match(visibleRule, /visibility:\s*visible;/);
});

test("released App Store CTAs open the published product page", () => {
  const appleLinks = [...html.matchAll(/<a\b[^>]*data-store="app-store"[^>]*>/g)].map(match => match[0]);
  assert.equal(appleLinks.length, 3);
  for (const link of appleLinks) {
    assert.match(link, /href="https:\/\/apps\.apple\.com\/kr\/app\/id6804934479"/);
    assert.match(link, /target="_blank"/);
    assert.match(link, /rel="noopener noreferrer"/);
    assert.doesNotMatch(link, /data-store-status/);
    assert.doesNotMatch(link, /aria-describedby/);
  }
  assert.doesNotMatch(html, /app-store-release|출시 준비 중/);
});
