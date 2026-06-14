import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const appPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../assets/app.js",
);
const appScript = readFileSync(appPath, "utf8");

function createElement({ dataset = {}, textContent = "" } = {}) {
  return {
    action: "/api/beta-signup",
    className: "",
    classList: {
      add() {},
      contains() {
        return false;
      },
      remove() {},
      toggle() {},
    },
    dataset: { ...dataset },
    disabled: false,
    focus() {},
    getBoundingClientRect() {
      return { top: 0 };
    },
    addEventListener() {},
    offsetWidth: 0,
    querySelector() {
      return null;
    },
    reset() {},
    textContent,
    value: "",
  };
}

function loadApp({
  datasetFeatureInterest = "rent_collection",
  search = "",
  source = "rent",
} = {}) {
  const gtagCalls = [];
  const formDataset = {
    campaignGoal: "demand_validation",
  };

  if (source !== undefined) formDataset.source = source;
  if (datasetFeatureInterest !== undefined) {
    formDataset.featureInterest = datasetFeatureInterest;
  }

  const elements = {
    beta: createElement(),
    contactInput: createElement(),
    formMessage: createElement({ textContent: "default message" }),
    signupForm: createElement({ dataset: formDataset }),
    submitButton: createElement(),
  };

  const document = {
    createElement() {
      return createElement();
    },
    getElementById(id) {
      return elements[id] || null;
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
  };

  const window = {
    addEventListener() {},
    document,
    innerHeight: 800,
    location: { search },
    matchMedia() {
      return { matches: false };
    },
  };

  const context = {
    cancelAnimationFrame() {},
    clearTimeout() {},
    document,
    fetch() {
      throw new Error("fetch should not be called by these tests");
    },
    gtag(...args) {
      gtagCalls.push(args);
    },
    performance: {
      now() {
        return 0;
      },
    },
    requestAnimationFrame() {
      return 0;
    },
    setTimeout() {
      return 0;
    },
    URLSearchParams,
    window,
  };
  context.globalThis = context;

  vm.runInContext(appScript, vm.createContext(context), {
    filename: appPath,
  });

  return { elements, gtagCalls };
}

function getContactFormViewParams(gtagCalls) {
  const eventCall = gtagCalls.find(
    ([command, eventName]) =>
      command === "event" && eventName === "beta_contact_form_view",
  );

  assert.ok(eventCall, "expected fallback beta_contact_form_view event");
  return eventCall[2];
}

test("feature_interest query canonicalizes tenant inquiry response over dataset fallback", () => {
  const { gtagCalls } = loadApp({
    datasetFeatureInterest: "rent_collection",
    search: "?feature_interest=tenant-inquiry-response",
  });

  assert.equal(
    getContactFormViewParams(gtagCalls).feature_interest,
    "tenant_inquiry_automation",
  );
});

test("supported query names canonicalize known aliases", () => {
  const cases = [
    ["?feature=collection", "rent_collection"],
    ["?use_case=move_out_dispute", "moveout_dispute_record"],
    ["?utm_content=inquery", "tenant_inquiry_automation"],
  ];

  for (const [search, expected] of cases) {
    const { gtagCalls } = loadApp({
      datasetFeatureInterest: "tenant_inquiry_automation",
      search,
    });

    assert.equal(getContactFormViewParams(gtagCalls).feature_interest, expected);
  }
});

test("unknown feature_interest query falls back to dataset feature", () => {
  const { gtagCalls } = loadApp({
    datasetFeatureInterest: "tenant_inquiry_automation",
    search: "?feature_interest=unreleased_ai_dashboard",
  });
  const params = getContactFormViewParams(gtagCalls);

  assert.equal(params.feature_interest, "tenant_inquiry_automation");
  assert.notEqual(params.feature_interest, "unreleased_ai_dashboard");
});

test("unknown feature query falls back to signup source", () => {
  const { gtagCalls } = loadApp({
    datasetFeatureInterest: "also_not_a_feature",
    search: "?feature=not_a_feature",
    source: "move_out_dispute",
  });

  assert.equal(
    getContactFormViewParams(gtagCalls).feature_interest,
    "moveout_dispute_record",
  );
});

test("unknown URL, dataset feature, and source produce unknown", () => {
  const { gtagCalls } = loadApp({
    datasetFeatureInterest: "future_dashboard",
    search: "?feature_interest=unreleased_ai_dashboard",
    source: "unsupported_source",
  });

  assert.equal(getContactFormViewParams(gtagCalls).feature_interest, "unknown");
});

test("hyphen and case normalization works for allowlisted aliases only", () => {
  const { gtagCalls } = loadApp({
    datasetFeatureInterest: "rent_collection",
    search: "?feature_interest=TENANT-INQUIRY",
  });

  assert.equal(
    getContactFormViewParams(gtagCalls).feature_interest,
    "tenant_inquiry_automation",
  );
});
