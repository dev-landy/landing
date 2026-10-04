import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mock } from "node:test";
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

const invalidBodies = [
  ["parsed null", null],
  ["parsed array", [{ phone: "010-1234-5678" }]],
  ["parsed number", 42],
  ["parsed boolean", true],
  ["JSON null", "null"],
  ["JSON array", '[{"phone":"010-1234-5678"}]'],
  ["JSON number", "42"],
  ["JSON boolean", "false"],
  ["JSON string", '"010-1234-5678"'],
];

for (const [description, body] of invalidBodies) {
  test(`rejects ${description} with a format error before calling Airtable`, async () => {
    const res = createResponse();
    const fetchMock = mock.method(globalThis, "fetch", async () => {
      throw new Error("invalid request must not call Airtable");
    });

    try {
      await handler({ method: "POST", body }, res);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.payload, { error: "요청 형식이 올바르지 않습니다." });
      assert.equal(res.headers["Cache-Control"], "no-store");
      assert.equal(fetchMock.mock.callCount(), 0);
    } finally {
      fetchMock.mock.restore();
    }
  });
}
