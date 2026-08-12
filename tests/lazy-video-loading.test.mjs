import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("preview videos wait until they approach the viewport", () => {
  const html = readFileSync(resolve(root, "index.html"), "utf8");
  const script = readFileSync(resolve(root, "assets/app.js"), "utf8");
  const videos = [...html.matchAll(/<video\b[\s\S]*?<\/video>/gi)].map(
    (match) => match[0],
  );

  assert.equal(videos.length, 3);
  for (const video of videos) {
    assert.match(video, /\bdata-lazy-video\b/);
    assert.match(video, /\bpreload="none"/);
    assert.match(video, /<source\s+data-src="assets\/[^"]+\.mov"\s*\/>/);
    assert.doesNotMatch(video, /<source\s+src=/);
  }

  assert.match(script, /source\[data-src\]/);
  assert.match(script, /IntersectionObserver/);
});
