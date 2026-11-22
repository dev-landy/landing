import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const pageUrl = "https://www.landy.co.kr/download";
const homepage = new URL("/", pageUrl).href;
const appStore = "https://apps.apple.com/kr/app/id6804934479";
const googlePlay = "https://play.google.com/store/apps/details?id=com.landy.app";
const html = readFileSync(new URL("../download.html", import.meta.url), "utf8");
const script = readFileSync(new URL("../assets/download.js", import.meta.url), "utf8");

// Resolve the actual fallback anchors the way the browser resolves link.href.
const links = new Map();
for (const [tag] of html.matchAll(/<a\b[^>]*>/gi)) {
  const id = tag.match(/\bid="([^"]+)"/)?.[1];
  const href = tag.match(/\bhref="([^"]+)"/)?.[1];
  if (id && href) links.set(id, { href: new URL(href, pageUrl).href });
}

test("/download serves manual links and loads the redirect after parsing the page", () => {
  const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.equal(config.cleanUrls, true);
  assert.match(html, /<script src="\/assets\/download\.js" defer><\/script>/);
  assert.deepEqual([...links.values()].map((link) => link.href).sort(), [appStore, googlePlay, homepage].sort());
});

for (const [device, userAgent, maxTouchPoints, destination] of [
  ["iPhone", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", 5, appStore],
  ["iPad", "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)", 5, appStore],
  ["iPod touch", "Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X)", 5, appStore],
  ["iPad in desktop mode", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)", 5, appStore],
  ["Mac at the single-touch boundary", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)", 1, homepage],
  ["Mac", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)", 0, homepage],
  ["Android phone", "Mozilla/5.0 (Linux; Android 15; Pixel 9) Mobile", 5, googlePlay],
  ["Android tablet", "Mozilla/5.0 (Linux; Android 14; SM-X710)", 5, googlePlay],
  ["touch-enabled Windows PC", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", 10, homepage],
  ["Linux", "Mozilla/5.0 (X11; Linux x86_64)", 0, homepage],
  ["unknown device", "", 0, homepage],
  ["mixed iOS and Android tokens", "iphone android", 5, appStore],
]) {
  test(`/download replaces the current history entry for ${device}`, () => {
    const navigations = [];
    vm.runInNewContext(script, {
      navigator: { userAgent, maxTouchPoints },
      document: { getElementById: (id) => links.get(id) },
      window: { location: { replace: (url) => navigations.push(url) } },
    });
    assert.deepEqual(navigations, [destination]);
  });
}
