import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const pageUrl = "https://www.landy.co.kr/download";
const homepage = new URL("/", pageUrl).href;
const appStore = "https://apps.apple.com/kr/app/id6804934479";
const googlePlay = "https://play.google.com/store/apps/details?id=com.landy.app";
const html = readFileSync(new URL("../download.html", import.meta.url), "utf8");
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
const script = scripts[0]?.[2];

// Resolve the actual fallback anchors the way the browser resolves link.href.
const links = new Map();
for (const [tag] of html.matchAll(/<a\b[^>]*>/gi)) {
  const id = tag.match(/\bid="([^"]+)"/)?.[1];
  const href = tag.match(/\bhref="([^"]+)"/)?.[1];
  if (id && href) links.set(id, { href: new URL(href, pageUrl).href });
}

test("/download can redirect as soon as the HTML provides all manual links", () => {
  const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.equal(config.cleanUrls, true);
  assert.equal(scripts.length, 1);
  assert.doesNotMatch(scripts[0][1], /\bsrc\s*=/i);
  assert.ok(script.trim());
  const lastLink = html.lastIndexOf("</a>");
  assert.ok(lastLink >= 0 && lastLink < scripts[0].index);
  assert.deepEqual([...links.values()].map((link) => link.href).sort(), [appStore, googlePlay, homepage].sort());
});

test("/download embeds the Landy favicon so the fallback needs no icon request", () => {
  const icon = readFileSync(new URL("../assets/icon.svg", import.meta.url), "utf8").trim();
  const favicon = html.match(/<link\b[^>]*rel="icon"[^>]*href="data:image\/svg\+xml,([^"]+)"/i);
  assert.ok(favicon);
  assert.equal(decodeURIComponent(favicon[1]), icon);
});

test("a file preview stays on the download screen", () => {
  vm.runInNewContext(script, {
    window: { location: { protocol: "file:", replace: () => assert.fail("unexpected navigation") } },
  });
});

test("the download screen embeds the original Korean store badges without image requests", () => {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)[1];
  assert.doesNotMatch(main, /<(?:img|image|use)\b[^>]*(?:src|href)="(?!#|data:)[^"]+"/i);
  for (const [id, name] of [["app-store", "App Store"], ["google-play", "Google Play"]]) {
    const link = main.match(new RegExp(`<a\\b[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?</a>`))?.[0];
    assert.ok(link, name);
    const asset = readFileSync(new URL(`../assets/${id}-badge.svg`, import.meta.url), "utf8");
    assert.ok(link.includes(asset.trimEnd()), `Expected the original ${id}-badge.svg inside the link`);
    assert.ok(link.includes(`aria-label="${name}에서 랜디 다운로드"`), name);
  }
});

const macUA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15";
const desktopChromeUA = "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 Chrome/148.0.0.0";
const linuxUA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36";

for (const [device, userAgent, maxTouchPoints, destination, userAgentData] of [
  ["iPhone", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", 5, appStore],
  ["iPad", "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)", 5, appStore],
  ["iPod touch", "Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X)", 5, appStore],
  ["iPad in desktop mode", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)", 5, appStore],
  ["iPhone Safari in desktop mode", macUA + " Version/27.0 Safari/605.1.15", 5, appStore],
  ["iOS Chrome in desktop mode without touch data", macUA + " CriOS/148 Safari/605.1.15", undefined, appStore],
  ["Mac at the single-touch boundary", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)", 1, homepage],
  ["Mac", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)", 0, homepage],
  ["Chrome on macOS", macUA + " Chrome/148.0.0.0 Safari/537.36", 0, homepage],
  ["unrelated token ending in CriOS", macUA + " Not-CriOS/148", 0, homepage],
  ["Android phone", "Mozilla/5.0 (Linux; Android 15; Pixel 9) Mobile", 5, googlePlay],
  ["Android tablet", "Mozilla/5.0 (Linux; Android 14; SM-X710)", 5, googlePlay],
  ["desktop UA with an explicit Android platform", desktopChromeUA, 0, googlePlay, { platform: "Android" }],
  ["the same UA on ChromeOS", desktopChromeUA, 5, homepage, { platform: "Chrome OS" }],
  ["Linux desktop UA with touch", linuxUA + " Chrome/148.0.0.0", 5, homepage, { platform: "Linux" }],
  ["Samsung desktop UA reporting Linux", linuxUA + " SamsungBrowser/31.0 Chrome/148.0.0.0", 5, homepage, { platform: "Linux" }],
  ["conflicting iOS Chrome and Android signals", macUA + " CriOS/148", 0, homepage, { platform: "Android" }],
  ["touch-enabled Windows PC", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", 10, homepage],
  ["Linux", "Mozilla/5.0 (X11; Linux x86_64)", 0, homepage],
  ["unknown device", "", 0, homepage],
  ["mixed iOS and Android tokens", "iphone android", 5, appStore],
]) {
  test(`/download replaces the current history entry for ${device}`, () => {
    const navigations = [];
    vm.runInNewContext(script, {
      navigator: { userAgent, maxTouchPoints, userAgentData },
      document: { getElementById: (id) => links.get(id) },
      window: { location: { protocol: "https:", replace: (url) => navigations.push(url) } },
    });
    assert.deepEqual(navigations, [destination]);
  });
}
