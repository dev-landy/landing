import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = resolve(root, "index.html");
const html = readFileSync(indexPath, "utf8");
const canonicalOrigin = "https://www.landy.co.kr";
const expectedTagline = "임대인의 시간을 아껴주는 월세관리 자동화 앱";
const expectedTitle = "랜디 | 임대인의 시간을 아껴주는 월세관리 자동화 앱";
const publicPages = [
  ["index.html", "/"],
  ["features/rent-collection.html", "/features/rent-collection"],
  ["features/overdue-notice.html", "/features/overdue-notice"],
  [
    "features/tenant-inquiry-response.html",
    "/features/tenant-inquiry-response",
  ],
  ["features/contract-expiry.html", "/features/contract-expiry"],
  ["features/move-out-dispute.html", "/features/move-out-dispute"],
  ["features/small-landlord-app.html", "/features/small-landlord-app"],
  ["legal/privacy-policy.html", "/legal/privacy-policy"],
  ["legal/data-deletion.html", "/legal/data-deletion"],
];

const metaContent = (source, attribute, value) => {
  const pattern = new RegExp(
    `<meta\\s+${attribute}="${value}"\\s+content="([^"]+)"\\s*\\/>`,
  );
  return source.match(pattern)?.[1];
};

test("home metadata uses the requested Landy search and sharing title", () => {
  assert.match(html, new RegExp(`<title>${expectedTitle}</title>`));
  assert.equal(metaContent(html, "property", "og:site_name"), "랜디");
  assert.equal(metaContent(html, "property", "og:title"), expectedTitle);
  assert.equal(metaContent(html, "name", "twitter:title"), expectedTitle);
});

test("every public page uses the production domain as its canonical URL", () => {
  for (const [relativePath, pathname] of publicPages) {
    const pageHtml = readFileSync(resolve(root, relativePath), "utf8");
    const canonical = pageHtml.match(
      /<link\s+rel="canonical"\s+href="([^"]+)"\s*\/>/,
    )?.[1];
    const expectedUrl = new URL(pathname, canonicalOrigin).href;

    assert.equal(canonical, expectedUrl, relativePath);
    assert.equal(metaContent(pageHtml, "property", "og:url"), expectedUrl);
    assert.equal(metaContent(pageHtml, "name", "robots"), "index,follow");
    assert.doesNotMatch(pageHtml, /landing\.landy\.co\.kr/, relativePath);
  }
});

test("crawl configuration publishes only the production domain", () => {
  const robots = readFileSync(resolve(root, "robots.txt"), "utf8");
  const sitemap = readFileSync(resolve(root, "sitemap.xml"), "utf8");
  const vercel = JSON.parse(readFileSync(resolve(root, "vercel.json"), "utf8"));
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  const expectedUrls = publicPages.map(([, pathname]) =>
    new URL(pathname, canonicalOrigin).href,
  );
  const redirectForHost = (host) =>
    vercel.redirects?.find((redirect) =>
      redirect.has?.some(
        (condition) => condition.type === "host" && condition.value === host,
      ),
    );

  assert.match(robots, /Sitemap: https:\/\/www\.landy\.co\.kr\/sitemap\.xml/);
  assert.deepEqual(sitemapUrls, expectedUrls);
  assert.doesNotMatch(`${robots}\n${sitemap}`, /landing\.landy\.co\.kr/);
  for (const host of ["landy.co.kr", "landing.landy.co.kr"]) {
    const redirect = redirectForHost(host);

    assert.equal(redirect?.destination, "https://www.landy.co.kr/:path*");
    assert.equal(redirect?.permanent, true);
  }
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
  assert.equal(website.url, `${canonicalOrigin}/`);
  assert.deepEqual(website.alternateName, [
    "랜디 월세관리",
    "Landy",
    "landy.co.kr",
  ]);
});
