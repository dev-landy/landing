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
const dataDeletionHtml = readFileSync(
  resolve(root, "legal/data-deletion.html"),
  "utf8",
);
const datePattern = "(\\d{4}년 \\d{1,2}월 \\d{1,2}일)";
const section = (html, start, end) => {
  const from = html.indexOf(start);
  const to = html.indexOf(end, from);
  assert.ok(from >= 0 && to > from, `expected a section between ${start} and ${end}`);
  return html.slice(from, to);
};

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
});

test("privacy policy hero effective date matches the 부칙 enforcement date", () => {
  const effective = privacyPolicyHtml.match(
    new RegExp(`<p class="legal-effective">본 방침은 ${datePattern}부터 적용됩니다\\.</p>`),
  );
  const enforced = privacyPolicyHtml.match(
    new RegExp(`본 개인정보처리방침은 ${datePattern}부터 시행됩니다\\.`),
  );
  const history = [
    ...privacyPolicyHtml.matchAll(new RegExp(`<li>\\s*${datePattern}:`, "g")),
  ].map((match) => match[1]);

  assert.ok(effective, "expected a legal-effective date in the hero");
  assert.ok(enforced, "expected an enforcement date in the 부칙");
  assert.equal(effective[1], enforced[1]);
  assert.equal(
    history.at(-1),
    enforced[1],
    "newest 개정 이력 entry should carry the enforcement date",
  );
});

test("privacy policy discloses RevenueCat subscription processing and overseas transfer", () => {
  const revenueCatMentions = privacyPolicyHtml.match(/RevenueCat, Inc\./g) ?? [];

  assert.ok(
    revenueCatMentions.length >= 5,
    "expected RevenueCat disclosures across the policy",
  );

  const items = section(
    privacyPolicyHtml,
    'id="privacy-policy-table-heading-1"',
    "<h2>3. 개인정보의 수집 방법</h2>",
  );
  assert.match(items, /<th scope="row">구독·결제 정보<\/th>/);
  assert.match(items, /서비스 내부 회원 식별자\(UUID\)/);

  const outsourcing = section(
    privacyPolicyHtml,
    'id="privacy-policy-table-heading-4"',
    'id="privacy-policy-table-heading-5"',
  );
  assert.match(
    outsourcing,
    /<th scope="row">RevenueCat, Inc\.<\/th>\s*<td>인앱 구독 결제 확인 및 구독 상태 관리<\/td>/,
  );

  const transfer = section(
    privacyPolicyHtml,
    'id="privacy-policy-table-heading-5"',
    "<h2>11. 개인정보의 파기 절차 및 방법</h2>",
  );
  assert.match(transfer, /<th scope="row">RevenueCat, Inc\.<\/th>\s*<td>미국<\/td>/);
  assert.match(transfer, /무료 회원에게도 구독 상태 확인을 위해/);
  assert.match(transfer, /구독을 해지하는 것만으로 이 전송이\s*중단되지는 않습니다/);
  assert.match(transfer, /개인정보 처리정지 또는 삭제/);
  assert.doesNotMatch(transfer, /Pro를 구독하지 않는 방법으로/);

  assert.match(privacyPolicyHtml, /탈퇴 계정의 무료 제공 횟수 이용 기록/);
  assert.match(privacyPolicyHtml, /탈퇴 계정의 구독 기록/);
  assert.match(privacyPolicyHtml, /구독 처리 안정성 기록/);
  assert.match(privacyPolicyHtml, /최종 처리 후 2년/);
  assert.match(privacyPolicyHtml, /진행 중이거나 재시도·복구가 필요한 기록/);
});

test("data deletion guide keeps the retention exceptions and points to store subscription management", () => {
  assert.match(dataDeletionHtml, /보관 예외를 제외하고/);
  assert.match(dataDeletionHtml, /<th scope="row">무료 제공 횟수 이용 기록<\/th>/);
  assert.match(dataDeletionHtml, /<th scope="row">구독 기록<\/th>/);
  assert.match(dataDeletionHtml, /<th scope="row">구독 처리 안정성 기록<\/th>/);
  assert.match(dataDeletionHtml, /최종 처리 후 2년간 보관 후 파기/);
  assert.match(dataDeletionHtml, /자동 갱신이 해지되지 않/);
  assert.match(dataDeletionHtml, /https:\/\/apps\.apple\.com\/account\/subscriptions/);
  assert.match(dataDeletionHtml, /https:\/\/play\.google\.com\/store\/account\/subscriptions/);
});
