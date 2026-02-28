import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get("payment_id");
  if (!paymentId) {
    return NextResponse.json({ error: "payment_id is required" }, { status: 400 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay credentials not configured" }, { status: 500 });
  }

  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Basic ${basicAuth}` },
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.error?.description ?? "Failed to fetch payment" }, { status: res.status });
  }

  const data = await res.json();

  // Return only what we need
  return NextResponse.json({
    method: data.method,           // "upi" | "card" | "netbanking" | "wallet" | "emi" | "paylater"
    card_network: data.card?.network ?? null,   // "Visa" | "Mastercard" | "RuPay" etc — only for card
    bank: data.bank ?? null,       // bank code for netbanking
    wallet: data.wallet ?? null,   // "paytm" | "phonepe" etc — for wallet
    vpa: data.vpa ?? null,         // UPI VPA like "user@upi" — for upi
  });
}
