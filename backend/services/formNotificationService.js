import nodemailer from "nodemailer";

let hasWarnedAboutMissingConfig = false;
let cachedTransporter = null;

function splitEmailList(value) {
  if (!value || typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getNotificationRecipients() {
  const configuredRecipients =
    process.env.FORM_NOTIFICATION_TO_EMAILS ||
    process.env.FORM_NOTIFICATION_TO_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "";

  return splitEmailList(configuredRecipients);
}

export function isFormNotificationConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      getNotificationRecipients().length > 0
  );
}

function getMailTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return cachedTransporter;
}

function warnMissingNotificationConfig() {
  if (hasWarnedAboutMissingConfig) {
    return;
  }

  hasWarnedAboutMissingConfig = true;

  console.warn(
    "Form notification emails are disabled. Add SMTP_HOST, SMTP_USER, SMTP_PASS, and FORM_NOTIFICATION_TO_EMAILS (or ADMIN_EMAIL) to enable them."
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeFieldValue(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ");
  }

  if (value === null || value === undefined) {
    return "";
  }

  return typeof value === "string" ? value.trim() : String(value);
}

function filterFields(fields) {
  return fields
    .map(({ label, value }) => ({
      label,
      value: normalizeFieldValue(value),
    }))
    .filter(({ value }) => value);
}

function buildHtmlEmail({ heading, intro, fields }) {
  const rows = fields
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #ebe5dc;font-weight:700;color:#455742;vertical-align:top;">${escapeHtml(
            label
          )}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #ebe5dc;color:#241f1a;">${escapeHtml(
            value
          )}</td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="background:#f6efe5;padding:32px 16px;font-family:Arial,sans-serif;color:#241f1a;">
      <div style="max-width:720px;margin:0 auto;background:#fffaf3;border:1px solid #e7ddcf;border-radius:24px;overflow:hidden;">
        <div style="padding:28px 28px 18px;background:linear-gradient(180deg,#f9f4ec 0%,#f4ebde 100%);border-bottom:1px solid #ebe5dc;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#8a6e2b;">Pera Music School</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:38px;line-height:1;color:#314533;">${escapeHtml(
            heading
          )}</h1>
          <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#665f56;">${escapeHtml(
            intro
          )}</p>
        </div>
        <div style="padding:24px 28px 28px;">
          <table style="width:100%;border-collapse:collapse;background:#fff;">
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function buildTextEmail({ heading, intro, fields }) {
  return [
    heading,
    "",
    intro,
    "",
    ...fields.map(({ label, value }) => `${label}: ${value}`),
  ].join("\n");
}

async function sendFormNotificationEmail({
  subject,
  heading,
  intro,
  fields,
  replyTo,
}) {
  if (!isFormNotificationConfigured()) {
    warnMissingNotificationConfig();
    return { sent: false, skipped: true };
  }

  const filteredFields = filterFields(fields);
  const transporter = getMailTransporter();
  const from =
    process.env.FORM_NOTIFICATION_FROM_EMAIL || process.env.SMTP_USER;

  if (!transporter || !from) {
    warnMissingNotificationConfig();
    return { sent: false, skipped: true };
  }

  await transporter.sendMail({
    from,
    to: getNotificationRecipients(),
    cc: splitEmailList(process.env.FORM_NOTIFICATION_CC_EMAILS || ""),
    bcc: splitEmailList(process.env.FORM_NOTIFICATION_BCC_EMAILS || ""),
    replyTo: replyTo || undefined,
    subject,
    html: buildHtmlEmail({
      heading,
      intro,
      fields: filteredFields,
    }),
    text: buildTextEmail({
      heading,
      intro,
      fields: filteredFields,
    }),
  });

  return { sent: true };
}

export function notifyWorkApplicationSubmitted(application) {
  return sendFormNotificationEmail({
    subject: `New work with us inquiry: ${application.fullName}`,
    heading: "New Teaching Inquiry",
    intro: "A new teaching inquiry was submitted through the Pera Music School website.",
    replyTo: application.email,
    fields: [
      { label: "Full name", value: application.fullName },
      { label: "Email", value: application.email },
      { label: "Phone", value: application.phone },
      { label: "Instruments", value: application.instruments },
      { label: "Submitted", value: application.createdAt },
    ],
  });
}

export function notifyTrialSessionSubmitted(request) {
  return sendFormNotificationEmail({
    subject: `New trial session request: ${request.studentName}`,
    heading: "New Trial Session Request",
    intro: "A new trial session form was submitted through the Pera Music School website.",
    replyTo: request.email,
    fields: [
      { label: "Student name", value: request.studentName },
      { label: "Parent / Guardian", value: request.parentName },
      { label: "Email", value: request.email },
      { label: "Phone", value: request.phone },
      { label: "Instrument", value: request.instrument },
      { label: "Trial date", value: request.trialDate },
      { label: "Teacher", value: request.teacher },
      { label: "Lesson length", value: request.lessonLength },
      { label: "Lesson time", value: request.lessonTime },
      { label: "Date of birth", value: request.dateOfBirth },
      { label: "Age", value: request.studentAge },
      { label: "Grade", value: request.grade },
      { label: "School", value: request.school },
      { label: "Address", value: request.address },
      { label: "Taken lessons before", value: request.hasPreviousLessons },
      { label: "Previous instruments", value: request.previousInstruments },
      { label: "Previous lesson years", value: request.previousLessonYears },
      { label: "Previous teacher / school", value: request.previousTeacherSchool },
      { label: "Can read music", value: request.musicReadingLevel },
      {
        label: "Practices another instrument",
        value: request.practicesAnotherInstrument,
      },
      { label: "Participation", value: request.participation },
      { label: "Program interests", value: request.programInterests },
      { label: "Experience level", value: request.experienceLevel },
      { label: "Availability", value: request.availability },
      { label: "Goals / Notes", value: request.goals },
      { label: "Submitted", value: request.createdAt },
    ],
  });
}
