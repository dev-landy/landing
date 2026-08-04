import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const indexPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../index.html",
);
const html = readFileSync(indexPath, "utf8");
const expectedTagline = "임대인의 시간을 아껴주는 월세관리 자동화 앱";
const expectedTitle = "랜디 | 임대인의 시간을 아껴주는 월세관리 자동화 앱";

const metaContent = (attribute, value) => {
  const pattern = new RegExp(
    `<meta\\s+${attribute}="${value}"\\s+content="([^"]+)"\\s*\\/>`,
  );
  return html.match(pattern)?.[1];
};

test("home metadata uses the requested Landy search and sharing title", () => {
  assert.match(html, new RegExp(`<title>${expectedTitle}</title>`));
  assert.equal(metaContent("property", "og:site_name"), "랜디");
  assert.equal(metaContent("property", "og:title"), expectedTitle);
  assert.equal(metaContent("name", "twitter:title"), expectedTitle);
});

test("home page displays the same Landy tagline as its metadata", () => {
  assert.match(
    html,
    new RegExp(`<p class="hero-eyebrow">${expectedTagline}</p>`),
  );
  assert.match(
    html,
    new RegExp(
      `<p class="brand-identity-tagline">\\s*${expectedTagline}\\s*</p>`,
    ),
  );
  assert.doesNotMatch(html, /건물주를 위한 월세 수납 자동화 앱/);
});

test("WebSite structured data keeps the concise Landy site name", () => {
  const jsonLd = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  assert.ok(jsonLd);

  const graph = JSON.parse(jsonLd[1])["@graph"];
  const website = graph.find((item) => item["@type"] === "WebSite");

  assert.equal(website.name, "랜디");
  assert.deepEqual(website.alternateName, ["Landy", "landing.landy.co.kr"]);
});
