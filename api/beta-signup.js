const AIRTABLE_URL =
  "https://api.airtable.com/v0/appRAwoskx9Eea5Me/tblsNjJi1VZIuvIx3";
const PHONE_PATTERN = /^01[016789]-?[0-9]{3,4}-?[0-9]{4}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

async function readRequestBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body === "string") {
      return JSON.parse(req.body || "{}");
    }
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "허용되지 않는 요청입니다." });
  }

  let body;
  try {
    body = await readRequestBody(req);
  } catch (error) {
    return sendJson(res, 400, { error: "요청 형식이 올바르지 않습니다." });
  }

  let phone = typeof body.phone === "string" ? body.phone.trim() : "";
  let email = typeof body.email === "string" ? body.email.trim() : "";
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  const requestedSource =
    typeof body.source === "string" ? body.source.trim() : "";
  const source = ["rent", "inquery", "move_out_dispute"].includes(
    requestedSource,
  )
    ? requestedSource
    : "rent";
  if (!phone && !email && contact) {
    if (PHONE_PATTERN.test(contact)) {
      phone = contact;
    } else if (EMAIL_PATTERN.test(contact)) {
      email = contact;
    }
  }

  const hasPhone = phone.length > 0;
  const hasEmail = email.length > 0;

  if (!hasPhone && !hasEmail) {
    return sendJson(res, 400, {
      error: contact
        ? "전화번호 또는 이메일 형식을 확인해주세요."
        : "전화번호 또는 이메일을 입력해주세요.",
    });
  }

  if (hasPhone && !PHONE_PATTERN.test(phone)) {
    return sendJson(res, 400, { error: "올바른 전화번호를 입력해주세요." });
  }

  if (hasEmail && !EMAIL_PATTERN.test(email)) {
    return sendJson(res, 400, { error: "올바른 이메일 주소를 입력해주세요." });
  }

  const token = process.env.AIRTABLE_TOKEN;

  if (!token) {
    return sendJson(res, 500, { error: "서버 설정이 완료되지 않았습니다." });
  }

  const fields = {
    Source: source,
  };
  if (hasPhone) fields.Phone = phone;
  if (hasEmail) fields.Email = email;

  try {
    const response = await fetch(AIRTABLE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Airtable request failed with ${response.status}`);
    }

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error("Airtable beta signup failed:", error.message);
    return sendJson(res, 502, {
      error: "신청을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.",
    });
  }
};
