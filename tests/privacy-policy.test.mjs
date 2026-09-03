import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const privacyPolicyHtml = readFileSync(
  resolve(root, "legal/privacy-policy.html"),
  "utf8",
);

test("privacy policy discloses PostHog processing and overseas transfer", () => {
  const postHogMentions = privacyPolicyHtml.match(/PostHog/g) ?? [];

  assert.ok(
    postHogMentions.length >= 6,
    "expected PostHog disclosures across the policy",
  );
  assert.match(privacyPolicyHtml, /앱 이용·진단 정보/);
  assert.match(privacyPolicyHtml, /앱 화면 이용 흐름 기록/);
  assert.match(privacyPolicyHtml, /PostHog Inc\./);
  assert.match(privacyPolicyHtml, /미국\(PostHog Cloud US 리전\)/);
  assert.match(privacyPolicyHtml, /2026년 9월 3일부터 시행됩니다/);
});
