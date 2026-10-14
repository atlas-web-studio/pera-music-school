import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import requireTurnstile from "../middleware/requireTurnstile.js";

const originalEnv = { ...process.env };
const testSecretKey = "1x0000000000000000000000000000000AA";

beforeEach(() => {
  process.env.NODE_ENV = "production";
  process.env.TURNSTILE_SECRET_KEY = "test-real-secret";
  process.env.TURNSTILE_ALLOWED_HOSTNAMES =
    "peramusicschool.com,www.peramusicschool.com";
  mock.method(console, "error", () => {});
  mock.method(console, "warn", () => {});
});

afterEach(() => {
  process.env = { ...originalEnv };
  mock.restoreAll();
});

async function verify(token = "valid-token", action = "trial_session") {
  const result = { nextCalled: false, status: 200, body: null };
  const res = {
    status(code) {
      result.status = code;
      return this;
    },
    json(body) {
      result.body = body;
      return this;
    },
  };
  await requireTurnstile(action)(
    { body: { turnstileToken: token }, ip: "127.0.0.1" },
    res,
    () => { result.nextCalled = true; }
  );
  return result;
}

function mockVerification(body, status = 200) {
  return mock.method(globalThis, "fetch", async () =>
    Response.json(body, { status })
  );
}

test("valid token, action and hostname allow a submission", async () => {
  const fetchMock = mockVerification({
    success: true,
    hostname: "peramusicschool.com",
    action: "trial_session",
  });
  assert.equal((await verify(" valid-token ")).nextCalled, true);
  const [url, options] = fetchMock.mock.calls[0].arguments;
  assert.equal(url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
  assert.equal(options.body.get("response"), "valid-token");
  assert.equal(options.body.get("secret"), "test-real-secret");
});

for (const token of [undefined, "", "  ", 12, "a".repeat(2049)]) {
  test(`malformed token is rejected before calling Cloudflare (${typeof token}, ${String(token).length})`, async () => {
    const fetchMock = mockVerification({ success: true });
    const result = await verify(token === undefined ? null : token);
    assert.equal(result.status, 400);
    assert.equal(result.nextCalled, false);
    assert.equal(fetchMock.mock.callCount(), 0);
  });
}

test("wrong hostname cannot submit even with a valid token", async () => {
  mockVerification({ success: true, hostname: "untrusted.example", action: "trial_session" });
  const result = await verify();
  assert.equal(result.status, 400);
  assert.equal(result.nextCalled, false);
});

test("a work-form token cannot be used for the trial form", async () => {
  mockVerification({ success: true, hostname: "peramusicschool.com", action: "work_application" });
  assert.equal((await verify()).status, 400);
});

test("expired or reused token gets a retryable error", async () => {
  mockVerification({ success: false, "error-codes": ["timeout-or-duplicate"] });
  const result = await verify();
  assert.equal(result.status, 400);
  assert.equal(result.body.code, "TURNSTILE_TOKEN_EXPIRED_OR_USED");
});

for (const key of ["TURNSTILE_SECRET_KEY", "TURNSTILE_ALLOWED_HOSTNAMES"]) {
  test(`missing ${key} blocks a submission`, async () => {
    delete process.env[key];
    const fetchMock = mockVerification({ success: true });
    assert.equal((await verify()).status, 503);
    assert.equal(fetchMock.mock.callCount(), 0);
  });
}

test("production refuses the always-pass test secret", async () => {
  process.env.TURNSTILE_SECRET_KEY = testSecretKey;
  const fetchMock = mockVerification({ success: true, hostname: "localhost", action: "test" });
  const result = await verify();
  assert.equal(result.status, 503);
  assert.equal(result.nextCalled, false);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("local tests can use Cloudflare dummy keys", async () => {
  process.env.NODE_ENV = "development";
  process.env.TURNSTILE_SECRET_KEY = testSecretKey;
  delete process.env.TURNSTILE_ALLOWED_HOSTNAMES;
  mockVerification({ success: true, hostname: "localhost", action: "test" });
  assert.equal((await verify()).nextCalled, true);
});

test("Cloudflare service error blocks the submission", async () => {
  mockVerification({}, 503);
  assert.equal((await verify()).status, 503);
});

test("network failure blocks the submission", async () => {
  mock.method(globalThis, "fetch", async () => { throw new Error("Network unavailable"); });
  assert.equal((await verify()).status, 503);
});

test("a stalled verification times out without allowing the request", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  mock.method(globalThis, "fetch", async (_url, { signal }) =>
    new Promise((_, reject) => {
      signal.addEventListener("abort", () => reject(new Error("Aborted")), { once: true });
    })
  );
  const pendingResult = verify();
  t.mock.timers.tick(8000);
  const result = await pendingResult;
  assert.equal(result.status, 503);
  assert.equal(result.nextCalled, false);
});
