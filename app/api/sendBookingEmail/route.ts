import { NextRequest, NextResponse } from "next/server";
import { getCityByDisplayName } from "@/lib/premiere-data";

const POSTMARK_API_URL = "https://api.postmarkapp.com/email";

type EmailPayload = {
  name: string;
  email: string;
  phone: string;
  city: string;
  ticketType: string;
  ticketCount: number;
  totalAmount: number;
  bookedAt: string;
  paymentId: string;
  paymentMethod: string | null;
  premiereDate: string;
};

function buildHtml(p: EmailPayload): string {
  const rows = [
    { label: "Name", value: p.name },
    { label: "Email", value: p.email },
    { label: "Mobile", value: `+91 ${p.phone}` },
    { label: "City", value: p.city },
    { label: "Premiere Date", value: p.premiereDate },
    { label: "Ticket Type", value: p.ticketType },
    { label: "No. of Tickets", value: `${p.ticketCount} ticket${p.ticketCount > 1 ? "s" : ""}` },
    { label: "Amount Paid", value: `₹${p.totalAmount.toLocaleString("en-IN")}` },
    { label: "Payment Mode", value: p.paymentMethod ?? "Online" },
    { label: "Payment ID", value: p.paymentId },
    { label: "Booked At", value: p.bookedAt },
  ];

  const rowsHtml = rows
    .map(
      (r) => `
      <tr>
        <td style="padding:12px 16px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#6b7280;white-space:nowrap;vertical-align:top;border-bottom:1px solid #f3f4f6;">${r.label}</td>
        <td style="padding:12px 16px;font-size:14px;font-weight:600;color:#012d2f;border-bottom:1px solid #f3f4f6;word-break:break-all;">${r.value}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed — Bindusagar</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f5;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td style="background:#012d2f;border-radius:16px 16px 0 0;padding:32px 32px 28px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.45);">Booking Confirmed</p>
              <h1 style="margin:0;font-size:24px;font-weight:900;color:#ffffff;line-height:1.2;">Bindusagar — ${p.ticketType}</h1>
            </td>
          </tr>

          <!-- Success badge -->
          <tr>
            <td style="background:#ffffff;padding:24px 32px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#d1fae5;border-radius:999px;padding:8px 16px;">
                    <span style="font-size:13px;font-weight:800;color:#065f46;">✓ Payment Successful</span>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
                Your tickets have been booked successfully. Venue and seat allotment details will be sent to your registered mobile number <strong>two days before the premiere</strong>.
              </p>
            </td>
          </tr>

          <!-- Details table -->
          <tr>
            <td style="background:#ffffff;padding:20px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f3f4f6;border-radius:12px;overflow:hidden;">
                ${rowsHtml}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#ffffff;border-radius:0 0 16px 16px;padding:24px 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;">
                <tr>
                  <td style="font-size:13px;color:#92400e;line-height:1.6;">
                    <strong>Note:</strong> This is your booking confirmation. Please keep this email for your records. Tickets are non-transferable.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td style="padding:20px 0 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">© Bindusagar · This is an automated confirmation email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildText(p: EmailPayload): string {
  return `BOOKING CONFIRMED — BINDUSAGAR ${p.ticketType.toUpperCase()}

Hi ${p.name},

Your booking is confirmed! Here are your details:

Name:            ${p.name}
Email:           ${p.email}
Mobile:          +91 ${p.phone}
City:            ${p.city}
Premiere Date:   ${p.premiereDate}
Ticket Type:     ${p.ticketType}
No. of Tickets:  ${p.ticketCount}
Amount Paid:     ₹${p.totalAmount.toLocaleString("en-IN")}
Payment Mode:    ${p.paymentMethod ?? "Online"}
Payment ID:      ${p.paymentId}
Booked At:       ${p.bookedAt}

NOTE: Venue and seat allotment details will be sent to your registered mobile number two days before the premiere.

© Bindusagar
`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name: string;
      email: string;
      phone: string;
      city: string;
      ticketType: string;
      ticketCount: number;
      totalAmount: number;
      bookedAt: string;
      paymentId: string;
      paymentMethod?: string | null;
    };

    const { name, email, phone, city, ticketType, ticketCount, totalAmount, bookedAt, paymentId, paymentMethod } = body;

    if (!email || !name || !ticketType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cityData = getCityByDisplayName(city ?? "");
    const showData = cityData?.shows.find(s => s.type === ticketType);
    const premiereDate = showData?.date ?? "—";

    const payload: EmailPayload = {
      name,
      email,
      phone,
      city: city ?? "",
      ticketType,
      ticketCount,
      totalAmount,
      bookedAt,
      paymentId,
      paymentMethod: paymentMethod ?? null,
      premiereDate,
    };

    const res = await fetch(POSTMARK_API_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": process.env.POSTMARK_SERVER_TOKEN!,
      },
      body: JSON.stringify({
        From: process.env.POSTMARK_FROM_EMAIL,
        To: email,
        Subject: `Booking Confirmed — Bindusagar ${ticketType}`,
        HtmlBody: buildHtml(payload),
        TextBody: buildText(payload),
        MessageStream: "outbound",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Postmark error:", data);
      return NextResponse.json({ error: "Failed to send email", detail: data }, { status: 500 });
    }

    return NextResponse.json({ ok: true, messageId: data.MessageID });
  } catch (err) {
    console.error("sendBookingEmail error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
