import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, mock, test } from "node:test";
import express from "express";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import WorkApplication from "../models/WorkApplication.js";
import TrialSessionRequest from "../models/TrialSessionRequest.js";
import workRoutes from "../routes/workApplicationRoutes.js";
import trialRoutes from "../routes/trialSessionRoutes.js";

const originalEnv = { ...process.env };
const originalFetch = globalThis.fetch;
let server;
let baseUrl;
let databaseConnected;
let mailBehavior;
let saved;
let mails;

const cases = [
  {
    path: "/api/work-applications",
    action: "work_application",
    responseKey: "application",
    model: WorkApplication,
    payload: {
      fullName: "QA Teaching Inquiry",
      email: "qa@example.com",
      phone: "5551234567",
      instruments: ["Piano"],
    },
  },
  {
    path: "/api/trial-sessions",
    action: "trial_session",
    responseKey: "trialSessionRequest",
    model: TrialSessionRequest,
    payload: {
      studentName: "QA Trial Request",
      email: "qa@example.com",
      phone: "5551234567",
      instrument: "Piano",
      lessonTime: "16:30",
    },
  },
];

before(async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/work-applications", workRoutes);
  app.use("/api/trial-sessions", trialRoutes);
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  Object.defineProperty(mongoose.connection, "readyState", {
    configurable: true,
    get: () => databaseConnected ? 1 : 0,
  });
});

after(async () => {
  delete mongoose.connection.readyState;
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
  databaseConnected = true;
  mailBehavior = "success";
  saved = [];
  mails = [];
  process.env.NODE_ENV = "production";
  process.env.TURNSTILE_SECRET_KEY = "test-real-secret";
  process.env.TURNSTILE_ALLOWED_HOSTNAMES = "peramusicschool.com";
  process.env.SMTP_HOST = "smtp.example.com";
  process.env.SMTP_USER = "notifications@example.com";
  process.env.SMTP_PASS = "fake-smtp-password";
  process.env.FORM_NOTIFICATION_FROM_EMAIL = "notifications@example.com";
  process.env.FORM_NOTIFICATION_TO_EMAILS = "inbox@example.com";
  process.env.FORM_NOTIFICATION_CC_EMAILS = "";
  process.env.FORM_NOTIFICATION_BCC_EMAILS = "";
  mock.method(console, "error", () => {});
  mock.method(console, "warn", () => {});
  mock.method(nodemailer, "createTransport", () => ({
    sendMail: async (mail) => {
      mails.push(mail);
      if (mailBehavior === "reject") throw new Error("SMTP unavailable");
      if (typeof mailBehavior === "function") return mailBehavior();
      return { accepted: mail.to };
    },
  }));
  for (const { model } of cases) {
    mock.method(model, "create", async (payload) => {
      const record = { ...payload, _id: "qa-id", createdAt: "2026-10-13T12:00:00Z", status: "NEW" };
      saved.push(record);
      return record;
    });
  }
  mock.method(globalThis, "fetch", async (url, options) => {
    if (String(url).startsWith(baseUrl)) return originalFetch(url, options);
    assert.equal(url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const action = options.body.get("response");
    return Response.json({
      success: action !== "invalid-token",
      hostname: "peramusicschool.com",
      action,
    });
  });
});

afterEach(() => {
  process.env = { ...originalEnv };
  mock.restoreAll();
});

async function submit(form, token = form.action, payload = form.payload) {
  const response = await fetch(`${baseUrl}${form.path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, turnstileToken: token }),
  });
  return { status: response.status, body: await response.json() };
}

for (const form of cases) {
  test(`${form.action}: verified request saves and builds an email`, async () => {
    const result = await submit(form);
    assert.equal(result.status, 201);
    assert.equal(result.body.storageMode, "database");
    assert.equal(saved.length, 1);
    assert.equal(mails.length, 1);
    assert.equal(saved[0].turnstileToken, undefined);
    assert.equal(mails[0].replyTo, form.payload.email);
    assert.deepEqual(mails[0].to, ["inbox@example.com"]);
    if (form.action === "trial_session") {
      assert.equal(result.body[form.responseKey].lessonTime, "4:30 PM");
      assert.match(mails[0].text, /Lesson time: 4:30 PM/);
    }
  });

  test(`${form.action}: invalid verification never saves or sends`, async () => {
    assert.equal((await submit(form, "invalid-token")).status, 400);
    assert.equal(saved.length, 0);
    assert.equal(mails.length, 0);
  });

  test(`${form.action}: missing verification never saves or sends`, async () => {
    assert.equal((await submit(form, "")).status, 400);
    assert.equal(saved.length, 0);
    assert.equal(mails.length, 0);
  });

  test(`${form.action}: missing required fields never save or send`, async () => {
    assert.equal((await submit(form, form.action, {})).status, 400);
    assert.equal(saved.length, 0);
    assert.equal(mails.length, 0);
  });

  test(`${form.action}: saved request responds without waiting for SMTP`, async () => {
    let finishMail;
    mailBehavior = () => new Promise((resolve) => { finishMail = resolve; });
    try {
      assert.equal((await submit(form)).status, 201);
      assert.equal(saved.length, 1);
      assert.equal(mails.length, 1);
    } finally {
      finishMail?.({ accepted: ["inbox@example.com"] });
    }
  });

  test(`${form.action}: database outage uses the email fallback`, async () => {
    databaseConnected = false;
    const result = await submit(form);
    assert.equal(result.status, 202);
    assert.equal(result.body.storageMode, "email-only");
    assert.equal(saved.length, 0);
    assert.equal(mails.length, 1);
  });

  test(`${form.action}: database and SMTP outage never claim success`, async () => {
    databaseConnected = false;
    mailBehavior = "reject";
    assert.equal((await submit(form)).status, 503);
    assert.equal(saved.length, 0);
  });

  test(`${form.action}: database outage and disabled email never claim success`, async () => {
    databaseConnected = false;
    delete process.env.SMTP_USER;
    assert.equal((await submit(form)).status, 503);
    assert.equal(saved.length, 0);
    assert.equal(mails.length, 0);
  });
}
