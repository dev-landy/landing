import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://www.landy.co.kr";
const faqPages = ["index.html", "features/rent-collection.html"].map((file) => {
  const html = readFileSync(resolve(root, file), "utf8");
  const items = [...html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/gi)]
    .map((match) => match[1]);
  return { file, html, items };
});

const normalize = (value) => value
  .replace(/<br\b[^>]*>|<\/(?:p|div|li)>/gi, " ")
  .replace(/<[^>]+>/g, "")
  .replace(/\s+/g, " ")
  .trim();

test("visible FAQs and search metadata contain the same questions and answers", () => {
  for (const { file, html, items } of faqPages) {
    assert.ok(items.length > 0, `${file}: no FAQ items found`);
    assert.equal(items.length, html.match(/<summary\b/gi)?.length, `${file}: unmatched FAQ summary`);
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const faq = data["@graph"].find((entry) => entry["@type"] === "FAQPage");
    const visible = items.map((item) => {
      const match = item.match(/^\s*<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*)$/i);
      assert.ok(match, `${file}: expected a summary before each FAQ answer`);
      const question = normalize(match[1]);
      const answer = normalize(match[2]);
      assert.ok(question && answer, `${file}: empty FAQ question or answer`);
      return { question, answer };
    });
    const indexed = faq.mainEntity.map((item) => ({ question: item.name, answer: item.acceptedAnswer.text }));
    assert.deepEqual(visible, indexed, file);
  }
});

test("internal links in marketing content reach existing pages and anchors", () => {
  const features = readdirSync(resolve(root, "features")).filter((name) => name.endsWith(".html"));
  for (const file of ["index.html", ...features.map((name) => `features/${name}`)]) {
    const html = readFileSync(resolve(root, file), "utf8");
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
    assert.ok(main, `${file}: expected main content`);
    const base = new URL(file, origin);
    const links = [...main[1].matchAll(/<a\b[^>]*?\shref\s*=\s*(["'])(.*?)\1/gi)]
      .map((match) => match[2]);
    assert.ok(links.length > 0, `${file}: no content links found`);
    for (const href of links) {
      const url = new URL(href, base);
      if (url.origin !== origin) continue;
      const path = decodeURIComponent(url.pathname).slice(1).replace(/\/$/, "") || "index.html";
      const target = resolve(root, extname(path) ? path : `${path}.html`);
      assert.ok(existsSync(target), `${file}: missing page for ${href}`);
      if (url.hash && target.endsWith(".html")) {
        const ids = [...readFileSync(target, "utf8").matchAll(/\sid\s*=\s*(["'])(.*?)\1/gi)]
          .map((attribute) => attribute[2]);
        assert.ok(ids.includes(decodeURIComponent(url.hash.slice(1))), `${file}: missing anchor for ${href}`);
      }
    }
  }
});

test("home FAQ explains platform support, permissions, current pricing, SMS, and beta access", () => {
  const html = readFileSync(resolve(root, "index.html"), "utf8");
  const faq = html.match(/<section[^>]*id="faq"[^>]*>([\s\S]*?)<\/section>/)[1];
  for (const term of ["아이폰", "안드로이드", "알림 접근 권한", "지원 은행", "기본 문자 앱", "직접 보내세요", "기본 기능은 무료", "통신사 요금제", "베타 참여"]) {
    assert.ok(faq.includes(term), term);
  }
  assert.doesNotMatch(faq, /무료로 제공할 예정|준비하고 있습니다/);
});
