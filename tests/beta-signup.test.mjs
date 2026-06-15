import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const handler = require("../api/beta-signup.js");

function createResponse() {
  return {
    headers: {},
    payload: null,
    statusCode: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
}

test("rejects email-only beta signup requests", async () => {
  const res = createResponse();
  const previousFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error("fetch should not be called");
  };

  try {
    await handler({ method: "POST", body: { email: "user@example.com" } }, res);
  } finally {
    globalThis.fetch = previousFetch;
  }

  assert.equal(res.statusCode, 400);
  assert.match(res.payload.error, /전화번호/);
});

test("sends only phone number fields to Airtable", async () => {
  const res = createResponse();
  const previousFetch = globalThis.fetch;
  const previousToken = process.env.AIRTABLE_TOKEN;
  let airtableBody;

  process.env.AIRTABLE_TOKEN = "test-token";
  globalThis.fetch = async (url, options) => {
    airtableBody = JSON.parse(options.body);
    return { ok: true, status: 200 };
  };

  try {
    await handler(
      {
        method: "POST",
        body: {
          phone: "010-1234-5678",
          email: "user@example.com",
          source: "rent",
        },
      },
      res,
    );
  } finally {
    globalThis.fetch = previousFetch;
    if (previousToken === undefined) {
      delete process.env.AIRTABLE_TOKEN;
    } else {
      process.env.AIRTABLE_TOKEN = previousToken;
    }
  }

  assert.equal(res.statusCode, 200);
  assert.deepEqual(airtableBody.records[0].fields, {
    Source: "rent",
    Phone: "010-1234-5678",
  });
});
