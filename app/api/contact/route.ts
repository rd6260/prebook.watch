import { NextRequest, NextResponse } from "next/server";

// ─── Recipient config ─────────────────────────────────────────────────────────
// All contact form submissions go to every address in this list.
// ─────────────────────────────────────────────────────────────────────────────

const RECIPIENT_EMAILS = [
  "rohandas.zero@gmail.com",
  "spide611@gmail.com",
  "team@platoon.one"
];

// ─── Subject labels ───────────────────────────────────────────────────────────

const SUBJECT_LABELS: Record<string, string> = {
  ticket_booking_error: "Ticket Booking Error",
  new_film_listing:     "New Film Listing",
  new_event_listing:    "New Event Listing",
  partnerships:         "Partnerships",
  media_enquiry:        "Media Enquiry",
};

// ─── Email builders ───────────────────────────────────────────────────────────

function buildHtmlEmail({
  name, email, subject, message, submittedAt,
}: {
  name: string; email: string; subject: string; message: string; submittedAt: string;
}): string {
  const subjectLabel = SUBJECT_LABELS[subject] ?? subject;
  const escapedMessage = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f5f5;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(1,45,47,0.10);">
        <tr>
          <td style="background:#012d2f;padding:28px 32px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.45);">Bindusagar · Contact Enquiry</p>
            <h1 style="margin:0;font-size:22px;font-weight:900;color:#ffffff;line-height:1.3;">${subjectLabel}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 8px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr><td style="padding-bottom:4px;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:rgba(1,45,47,0.4);">Name</td></tr>
              <tr><td style="font-size:15px;font-weight:700;color:#012d2f;">${name}</td></tr>
            </table>
            <div style="height:1px;background:rgba(1,45,47,0.07);margin-bottom:20px;"></div>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr><td style="padding-bottom:4px;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:rgba(1,45,47,0.4);">Email</td></tr>
              <tr><td style="font-size:15px;font-weight:700;color:#012d2f;"><a href="mailto:${email}" style="color:#012d2f;text-decoration:underline;">${email}</a></td></tr>
            </table>
            <div style="height:1px;background:rgba(1,45,47,0.07);margin-bottom:20px;"></div>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr><td style="padding-bottom:4px;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:rgba(1,45,47,0.4);">Subject</td></tr>
              <tr><td><span style="display:inline-block;background:#e0f2f1;color:#004d40;font-size:12px;font-weight:800;padding:4px 12px;border-radius:20px;">${subjectLabel}</span></td></tr>
            </table>
            <div style="height:1px;background:rgba(1,45,47,0.07);margin-bottom:20px;"></div>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr><td style="padding-bottom:8px;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:rgba(1,45,47,0.4);">Message</td></tr>
              <tr><td style="font-size:14px;font-weight:500;color:#012d2f;line-height:1.7;background:rgba(1,45,47,0.04);border-radius:10px;padding:14px 16px;">${escapedMessage}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 28px;">
            <div style="background:rgba(1,45,47,0.04);border:1px solid rgba(1,45,47,0.08);border-radius:10px;padding:12px 16px;">
              <p style="margin:0;font-size:11px;color:rgba(1,45,47,0.45);line-height:1.6;">
                <strong style="color:rgba(1,45,47,0.7);">Received:</strong> ${submittedAt}<br/>
                Reply directly to <a href="mailto:${email}" style="color:#012d2f;">${email}</a> to respond.
              </p>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function buildTextEmail({
  name, email, subject, message, submittedAt,
}: {
  name: string; email: string; subject: string; message: string; submittedAt: string;
}): string {
  const subjectLabel = SUBJECT_LABELS[subject] ?? subject;
  return [
    "New Contact Enquiry — Bindusagar",
    "=".repeat(40),
    `Name:    ${name}`,
    `Email:   ${email}`,
    `Subject: ${subjectLabel}`,
    "",
    "Message:",
    message,
    "",
    "-".repeat(40),
    `Received: ${submittedAt}`,
    `Reply to: ${email}`,
  ].join("\n");
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; subject?: string; message?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, subject, message } = body;

  if (!name?.trim())    return NextResponse.json({ error: "Name is required" },    { status: 400 });
  if (!email?.trim())   return NextResponse.json({ error: "Email is required" },   { status: 400 });
  if (!subject?.trim()) return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const submittedAt = new Date().toLocaleString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
  });

  const subjectLabel = SUBJECT_LABELS[subject.trim()] ?? subject.trim();
  const emailPayload = {
    name: name.trim(), email: email.trim(),
    subject: subject.trim(), message: message.trim(), submittedAt,
  };

  const postmarkRes = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "Accept":                  "application/json",
      "Content-Type":            "application/json",
      "X-Postmark-Server-Token": process.env.POSTMARK_SERVER_TOKEN!,
    },
    body: JSON.stringify({
      From:          process.env.POSTMARK_FROM_EMAIL ?? "noreply@bindusagar.in",
      To:            RECIPIENT_EMAILS.join(", "),
      ReplyTo:       email.trim(),
      Subject:       `[Contact] ${subjectLabel} — ${name.trim()}`,
      HtmlBody:      buildHtmlEmail(emailPayload),
      TextBody:      buildTextEmail(emailPayload),
      MessageStream: "outbound",
    }),
  });

  if (!postmarkRes.ok) {
    const errBody = await postmarkRes.text();
    console.error("Postmark error:", errBody);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
