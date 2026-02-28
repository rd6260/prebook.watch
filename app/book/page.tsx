"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ─── Config ────────────────────────────────────────────────────────────────

const TICKET_PRICES: Record<string, number> = {
  Industry: 400,
  Public: 350,
  Matinee: 350,
};

const PREMIERE_DATES: Record<string, string> = {
  Industry: "Friday, April 11",
  Public: "Thursday, April 9",
  Matinee: "Thursday, April 9",
};

/**
 * Maximum tickets available per city + show type combination.
 * Keys are lowercase: `${city.toLowerCase()}:${type}`
 */
const TICKET_LIMITS: Record<string, number> = {
  "bhubaneswar:industry": 300,
  "bhubaneswar:public": 1200,
  "cuttack:matinee": 200,
};

const GLOBAL_MAX_PER_BOOKING = 25;

function getTicketLimit(city: string, type: string): number {
  const key = `${city.trim().toLowerCase()}:${type.toLowerCase()}`;
  return TICKET_LIMITS[key] ?? GLOBAL_MAX_PER_BOOKING;
}

// ─── Types ──────────────────────────────────────────────────────────────────
type BookingForm = {
  name: string;
  phone: string;
  email: string;
  ticket_count: number;
};

type BookingStep = "form" | "payment" | "success";

type PaymentDetails = {
  method: string;
  card_network: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
};

type SuccessDetails = {
  name: string;
  email: string;
  phone: string;
  city: string;
  ticketType: string;
  ticketCount: number;
  totalAmount: number;
  bookedAt: Date;
  paymentId: string;
  paymentDetails: PaymentDetails | null;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

/** Turn Razorpay's raw payment data into a human-readable label + sub-label */
function formatPaymentMethod(p: PaymentDetails): { label: string; sub: string | null } {
  switch (p.method) {
    case "card":
      return { label: p.card_network ? `${p.card_network} Card` : "Card", sub: null };
    case "upi":
      return { label: "UPI", sub: p.vpa ?? null };
    case "netbanking":
      return { label: "Net Banking", sub: p.bank ?? null };
    case "wallet":
      return {
        label: p.wallet
          ? p.wallet.charAt(0).toUpperCase() + p.wallet.slice(1) + " Wallet"
          : "Wallet",
        sub: null,
      };
    case "emi":
      return { label: "EMI", sub: p.card_network ?? null };
    case "paylater":
      return { label: "Pay Later", sub: null };
    default:
      return { label: p.method, sub: null };
  }
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function InputField({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required,
}: {
  label: string;
  id: string;
  type?: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-black uppercase tracking-widest text-[hsl(181_100%_9%)]"
      >
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold text-[hsl(181_100%_9%)] placeholder:text-[hsl(181_100%_9%/0.25)] bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(181_100%_9%/0.15)] transition-all ${
          error
            ? "border-red-300 focus:border-red-400"
            : "border-[hsl(181_100%_9%/0.12)] focus:border-[hsl(181_100%_9%/0.3)]"
        }`}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

// ─── Payment Modal ───────────────────────────────────────────────────────────
function PaymentModal({
  ticketType,
  ticketCount,
  bookingId,
  phone,
  email,
  onSuccess,
  onClose,
}: {
  ticketType: string;
  ticketCount: number;
  bookingId: string;
  phone: string;
  email: string;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}) {
  const pricePerTicket = TICKET_PRICES[ticketType] ?? 350;
  const totalAmount = pricePerTicket * ticketCount;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setLoading(true);
    setError("");

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Failed to load payment gateway. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/createOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount * 100,
          currency: "INR",
          booking_id: bookingId,
          phone_no: phone,
          email,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error ?? "Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Bindusagar Premiere",
        description: `${ticketType} Premiere · ${ticketCount} ticket${ticketCount > 1 ? "s" : ""}`,
        order_id: orderData.razorpay_order_id,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/verifyOrder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              booking_id: bookingId,
              payment_id: orderData.payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.isOk) {
            onSuccess(response.razorpay_payment_id);
          } else {
            setError("Payment verification failed. Contact support.");
          }
        },
        prefill: { contact: phone },
        theme: { color: "#012d2f" },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-[hsl(181_100%_9%)] px-6 py-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Order Summary</p>
          <h2 className="text-white font-black text-xl">Complete Payment</h2>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-[hsl(181_100%_9%/0.55)] font-medium">
                {ticketType} Premiere × {ticketCount} ticket{ticketCount > 1 ? "s" : ""}
              </span>
              <span className="font-bold text-[hsl(181_100%_9%)]">
                ₹{pricePerTicket} × {ticketCount}
              </span>
            </div>
            <div className="h-px bg-[hsl(181_100%_9%/0.08)]" />
            <div className="flex justify-between">
              <span className="font-black text-[hsl(181_100%_9%)] text-base">Total</span>
              <span className="font-black text-[hsl(181_100%_9%)] text-xl">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
          <div className="flex gap-2 bg-[hsl(181_100%_9%/0.04)] rounded-xl px-3 py-2.5">
            <span className="material-symbols-outlined text-sm text-[hsl(181_100%_9%/0.4)] flex-shrink-0 mt-0.5">info</span>
            <p className="text-xs text-[hsl(181_100%_9%/0.55)] leading-relaxed">
              Tickets will be allotted prior to the event. Details will be sent to your registered email or phone number.
            </p>
          </div>
          {error && (
            <p className="text-xs text-red-500 font-semibold bg-red-50 rounded-xl px-3 py-2.5">{error}</p>
          )}
          <div className="flex gap-3 mt-1">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border border-[hsl(181_100%_9%/0.15)] text-sm font-bold text-[hsl(181_100%_9%/0.6)] hover:bg-[hsl(181_100%_9%/0.04)] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handlePay}
              disabled={loading}
              className="flex-[2] py-3 rounded-xl bg-[hsl(181_100%_9%)] text-white text-sm font-bold hover:bg-[hsl(181_100%_12%)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-[hsl(181_100%_9%/0.2)] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Processing…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">lock</span>
                  Pay ₹{totalAmount.toLocaleString("en-IN")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Success Screen ──────────────────────────────────────────────────────────
function SuccessScreen({ details }: { details: SuccessDetails }) {
  const premiereDate = PREMIERE_DATES[details.ticketType] ?? "—";
  const paymentLabel = details.paymentDetails
    ? formatPaymentMethod(details.paymentDetails)
    : null;

  const [saving, setSaving] = useState(false);

  async function handleSaveImage() {
    setSaving(true);
    try {
      const DARK = "#012d2f";
      const W = 900;
      const PAD = 48;
      const COL = W - PAD * 2;
      const RADIUS = 20;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      function roundRect(x: number, y: number, w: number, h: number, r: number) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      }

      function label(text: string, x: number, y: number) {
        ctx.font = "600 22px system-ui, sans-serif";
        ctx.fillStyle = "rgba(1,45,47,0.4)";
        ctx.letterSpacing = "2px";
        ctx.fillText(text.toUpperCase(), x, y);
        ctx.letterSpacing = "0px";
      }

      function value(text: string, x: number, y: number, maxW?: number) {
        ctx.font = "700 30px system-ui, sans-serif";
        ctx.fillStyle = DARK;
        if (maxW) ctx.fillText(text, x, y, maxW);
        else ctx.fillText(text, x, y);
      }

      function divider(y: number) {
        ctx.beginPath();
        ctx.moveTo(PAD, y);
        ctx.lineTo(W - PAD, y);
        ctx.strokeStyle = "rgba(1,45,47,0.07)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      const rows = [
        { label: "NAME",          val: details.name },
        { label: "EMAIL",         val: details.email },
        { label: "MOBILE",        val: `+91 ${details.phone}` },
        { label: "CITY",          val: details.city },
        { label: "PREMIERE DATE", val: premiereDate },
        { label: "TICKETS",       val: `${details.ticketCount} ticket${details.ticketCount > 1 ? "s" : ""}` },
        { label: "TICKET TYPE",   val: `${details.ticketType} Premiere` },
        { label: "BOOKED AT",     val: formatDateTime(details.bookedAt) },
      ];

      const HEADER_H = 110;
      const ROW_H = 90;
      const FOOTER_H = 130;
      const TOP_PAD = 60;
      const BOTTOM_PAD = 60;
      const totalH = TOP_PAD + HEADER_H + rows.length * ROW_H + 24 + FOOTER_H + BOTTOM_PAD;

      canvas.width = W * 2;
      canvas.height = totalH * 2;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${totalH}px`;
      ctx.scale(2, 2);

      ctx.fillStyle = "#f4f5f5";
      ctx.fillRect(0, 0, W, totalH);

      const cardX = PAD;
      const cardY = TOP_PAD;
      const cardW = COL;
      const cardH = totalH - TOP_PAD - BOTTOM_PAD;

      ctx.shadowColor = "rgba(1,45,47,0.10)";
      ctx.shadowBlur = 32;
      ctx.shadowOffsetY = 8;
      roundRect(cardX, cardY, cardW, cardH, RADIUS);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      roundRect(cardX, cardY, cardW, HEADER_H, RADIUS);
      ctx.fillStyle = DARK;
      ctx.fill();
      ctx.fillRect(cardX, cardY + HEADER_H / 2, cardW, HEADER_H / 2);

      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = "600 20px system-ui, sans-serif";
      ctx.letterSpacing = "3px";
      ctx.fillText("BOOKING DETAILS", cardX + 32, cardY + 38);
      ctx.letterSpacing = "0px";

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 30px system-ui, sans-serif";
      ctx.fillText(`Bindusagar — ${details.ticketType} Premiere`, cardX + 32, cardY + 78);

      let y = cardY + HEADER_H + 18;
      rows.forEach((row, i) => {
        label(row.label, cardX + 32, y + 24);
        value(row.val, cardX + 32, y + 56, cardW - 64);
        if (i < rows.length - 1) divider(y + ROW_H);
        y += ROW_H;
      });

      const footerY = y + 16;
      roundRect(cardX + 16, footerY, cardW - 32, FOOTER_H - 16, 14);
      ctx.fillStyle = "rgba(1,45,47,0.04)";
      ctx.fill();
      ctx.strokeStyle = "rgba(1,45,47,0.08)";
      ctx.lineWidth = 1.5;
      roundRect(cardX + 16, footerY, cardW - 32, FOOTER_H - 16, 14);
      ctx.stroke();

      ctx.fillStyle = "rgba(1,45,47,0.4)";
      ctx.font = "600 20px system-ui, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("AMOUNT PAID", cardX + 36, footerY + 34);
      ctx.letterSpacing = "0px";
      ctx.fillStyle = DARK;
      ctx.font = "800 40px system-ui, sans-serif";
      ctx.fillText(`₹${details.totalAmount.toLocaleString("en-IN")}`, cardX + 36, footerY + 78);

      const badgeLabel = paymentLabel ? paymentLabel.label : "Online";
      ctx.font = "700 24px system-ui, sans-serif";
      const bw = ctx.measureText(badgeLabel).width + 32;
      const bx = cardX + cardW - 32 - bw;
      const by = footerY + 30;
      roundRect(bx, by, bw, 42, 21);
      ctx.fillStyle = "#d1fae5";
      ctx.fill();
      ctx.fillStyle = "#065f46";
      ctx.fillText(badgeLabel, bx + 16, by + 28);

      if (paymentLabel?.sub) {
        ctx.fillStyle = "rgba(1,45,47,0.4)";
        ctx.font = "500 20px system-ui, sans-serif";
        ctx.fillText(paymentLabel.sub, bx, by + 60);
      }

      if (details.paymentId) {
        ctx.fillStyle = "rgba(1,45,47,0.28)";
        ctx.font = "500 18px monospace";
        ctx.fillText(details.paymentId, cardX + 36, footerY + FOOTER_H - 20);
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.96);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `bindusagar-booking-${details.name.replace(/\s+/g, "-").toLowerCase()}.jpg`;
      link.click();
    } catch (err) {
      console.error("Failed to save image:", err);
    } finally {
      setSaving(false);
    }
  }

  function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
      <div className="flex items-start gap-3 py-3 border-b border-[hsl(181_100%_9%/0.06)] last:border-0">
        <span className="material-symbols-outlined text-[hsl(181_100%_9%/0.35)] text-base flex-shrink-0 mt-0.5">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.35)] mb-0.5">
            {label}
          </p>
          <p className="text-sm font-bold text-[hsl(181_100%_9%)] break-words">{value}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(181_5%_97%)] flex flex-col items-center justify-start pt-10 pb-16 px-4">
      <div id="booking-confirmation" className="w-full max-w-md">
        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-emerald-600">check_circle</span>
          </div>
          <h1 className="font-black text-[hsl(181_100%_9%)] text-2xl mb-1">Booking Confirmed!</h1>
          <p className="text-sm text-[hsl(181_100%_9%/0.5)] leading-relaxed">
            Your tickets have been booked successfully. A confirmation will be sent to your registered contact.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[hsl(181_100%_9%/0.08)] shadow-sm overflow-hidden mb-4">
          <div className="bg-[hsl(181_100%_9%)] px-5 py-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-white/70 text-lg">confirmation_number</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Booking Details</p>
              <p className="text-white font-black text-base leading-tight">
                Bindusagar — {details.ticketType} Premiere
              </p>
            </div>
          </div>

          <div className="px-5 pt-1 pb-2">
            <Row icon="person"              label="Name"              value={details.name} />
            <Row icon="mail"                label="Email"             value={details.email} />
            <Row icon="smartphone"          label="Mobile"            value={`+91 ${details.phone}`} />
            <Row icon="location_on"         label="City"              value={details.city} />
            <Row icon="event"               label="Premiere Date"     value={premiereDate} />
            <Row icon="confirmation_number" label="Number of Tickets" value={`${details.ticketCount} ticket${details.ticketCount > 1 ? "s" : ""}`} />
            <Row icon="movie"               label="Ticket Type"       value={`${details.ticketType} Premiere`} />
            <Row icon="schedule"            label="Booked At"         value={formatDateTime(details.bookedAt)} />
          </div>

          <div className="mx-4 mb-4 rounded-xl bg-[hsl(181_100%_9%/0.04)] border border-[hsl(181_100%_9%/0.08)] px-4 py-3.5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.4)] mb-0.5">
                Amount Paid
              </p>
              <p className="text-2xl font-black text-[hsl(181_100%_9%)]">
                ₹{details.totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.4)] mb-1">
                Payment Mode
              </p>
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-black px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-sm">verified</span>
                {paymentLabel ? paymentLabel.label : "Online"}
              </span>
              {paymentLabel?.sub && (
                <p className="text-[10px] text-[hsl(181_100%_9%/0.4)] font-medium mt-1">{paymentLabel.sub}</p>
              )}
              {details.paymentId && (
                <p className="text-[10px] text-[hsl(181_100%_9%/0.3)] font-medium mt-1 font-mono">{details.paymentId}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
          <span className="material-symbols-outlined text-amber-500 text-base flex-shrink-0 mt-0.5">info</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold">Note:</span> Venue and seat allotment details will be sent to your registered mobile number two days before the premiere.
          </p>
        </div>

        <button
          onClick={handleSaveImage}
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-[hsl(181_100%_9%)] text-white text-sm font-bold hover:bg-[hsl(181_100%_12%)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-[hsl(181_100%_9%/0.15)] disabled:opacity-60"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
              Saving…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">image</span>
              Save to Gallery
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
function BookingPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // type comes from URL always
  const ticketType = (searchParams.get("type") ?? "Public") as "Public" | "Industry" | "Matinee";

  // city: prefer URL param, fall back to localStorage
  const cityFromUrl = searchParams.get("city");
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    if (cityFromUrl) {
      // Sync URL city into localStorage so other parts of the app stay consistent
      localStorage.setItem("preferredCity", cityFromUrl);
      setCity(cityFromUrl);
    } else {
      const stored = localStorage.getItem("preferredCity");
      if (!stored) {
        router.replace("/");
      } else {
        setCity(stored);
      }
    }
  }, [cityFromUrl, router]);

  const supabase = createClient();

  const pricePerTicket = TICKET_PRICES[ticketType] ?? 350;

  // Derive the per-show ticket limit once city is known
  const maxTickets = city ? Math.min(getTicketLimit(city, ticketType), GLOBAL_MAX_PER_BOOKING) : GLOBAL_MAX_PER_BOOKING;

  const [form, setForm] = useState<BookingForm>({
    name: "",
    phone: "",
    email: "",
    ticket_count: 1,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingForm, string>>>({});
  const [step, setStep] = useState<BookingStep>("form");
  const [bookingId, setBookingId] = useState<string>("");
  const [successDetails, setSuccessDetails] = useState<SuccessDetails | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  function validate(): boolean {
    const e: Partial<Record<keyof BookingForm, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = "Enter a valid 10-digit mobile number";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (form.ticket_count < 1 || form.ticket_count > maxTickets) {
      e.ticket_count = `Between 1 and ${maxTickets} tickets`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    setServerError("");

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        ticket_count: form.ticket_count,
        ticket_type: ticketType,
        city,
        is_paid: false,
      })
      .select("id")
      .single();

    setSubmitting(false);

    if (error || !data) {
      setServerError("Failed to save booking. Please try again.");
      return;
    }

    setBookingId(data.id);
    setStep("payment");
  }

  async function handlePaymentSuccess(paymentId: string) {
    let paymentDetails: PaymentDetails | null = null;
    try {
      const res = await fetch(`/api/getPaymentDetails?payment_id=${paymentId}`);
      if (res.ok) paymentDetails = await res.json();
    } catch {
      // Non-critical
    }

    const bookedAt = new Date();
    const totalAmount = pricePerTicket * form.ticket_count;

    setSuccessDetails({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: city ?? "",
      ticketType,
      ticketCount: form.ticket_count,
      totalAmount,
      bookedAt,
      paymentId,
      paymentDetails,
    });
    setStep("success");

    // Send confirmation email — fire and forget
    fetch("/api/sendBookingEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city,
        ticketType,
        ticketCount: form.ticket_count,
        totalAmount,
        bookedAt: bookedAt.toLocaleString("en-IN", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
          hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
        }),
        paymentId,
        paymentMethod: paymentDetails ? (() => {
          const p = paymentDetails!;
          switch (p.method) {
            case "card":       return p.card_network ? `${p.card_network} Card` : "Card";
            case "upi":        return p.vpa ? `UPI (${p.vpa})` : "UPI";
            case "netbanking": return p.bank ? `Net Banking (${p.bank})` : "Net Banking";
            case "wallet":     return p.wallet ? `${p.wallet} Wallet` : "Wallet";
            default:           return p.method;
          }
        })() : null,
      }),
    }).catch((err) => console.error("Email send failed:", err));
  }

  if (city === null) return null;
  if (step === "success" && successDetails) return <SuccessScreen details={successDetails} />;

  return (
    <div className="min-h-screen bg-[hsl(181_5%_97%)]">
      {/* Top bar */}
      <div className="bg-white border-b border-[hsl(181_100%_9%/0.08)] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[hsl(181_100%_9%/0.06)] transition-all"
          >
            <span className="material-symbols-outlined text-lg text-[hsl(181_100%_9%)]">arrow_back</span>
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.4)]">
              Bindusagar · {city}
            </p>
            <h1 className="text-base font-black text-[hsl(181_100%_9%)] leading-tight">
              {ticketType} Premiere · Book Tickets
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Price + availability badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-[hsl(181_100%_9%)] text-white text-xs font-black px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-sm">confirmation_number</span>
            ₹{pricePerTicket} per ticket
          </span>
          {/*
          <span className="inline-flex items-center gap-1.5 bg-[hsl(181_100%_9%/0.06)] text-[hsl(181_100%_9%/0.7)] text-xs font-bold px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-sm">event_seat</span>
            {getTicketLimit(city, ticketType).toLocaleString("en-IN")} total seats
          </span>
          <span className="text-xs text-[hsl(181_100%_9%/0.4)] font-medium">
            Max {maxTickets} per booking
          </span>
          */}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-[hsl(181_100%_9%/0.08)] shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-1">
            <h2 className="font-black text-[hsl(181_100%_9%)] text-base mb-0.5">Your Details</h2>
            <p className="text-xs text-[hsl(181_100%_9%/0.45)] mb-5">Fill in your information to reserve seats</p>
            <div className="flex flex-col gap-4">
              <InputField label="Full Name" id="name" value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="Enter your full name" error={errors.name as string | undefined} required />
              <InputField label="Mobile Number" id="phone" type="tel" value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                placeholder="10-digit mobile number" error={errors.phone as string | undefined} required />
              <InputField label="Email Address" id="email" type="email" value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                placeholder="you@example.com" error={errors.email as string | undefined} required />

              {/* Ticket count stepper */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.45)]">
                  Number of Tickets <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <button type="button"
                    onClick={() => setForm((f) => ({ ...f, ticket_count: Math.max(1, f.ticket_count - 1) }))}
                    className="w-10 h-10 rounded-xl border border-[hsl(181_100%_9%/0.12)] flex items-center justify-center text-[hsl(181_100%_9%)] hover:bg-[hsl(181_100%_9%/0.05)] active:scale-95 transition-all font-bold text-lg">
                    −
                  </button>
                  <span className="w-10 text-center font-black text-[hsl(181_100%_9%)] text-lg tabular-nums">
                    {form.ticket_count}
                  </span>
                  <button type="button"
                    onClick={() => setForm((f) => ({ ...f, ticket_count: Math.min(maxTickets, f.ticket_count + 1) }))}
                    className="w-10 h-10 rounded-xl border border-[hsl(181_100%_9%/0.12)] flex items-center justify-center text-[hsl(181_100%_9%)] hover:bg-[hsl(181_100%_9%/0.05)] active:scale-95 transition-all font-bold text-lg">
                    +
                  </button>
                  <span className="text-sm text-[hsl(181_100%_9%)] font-medium">
                    = ₹{(form.ticket_count * pricePerTicket).toLocaleString("en-IN")}
                  </span>
                </div>
                {errors.ticket_count && (
                  <p className="text-xs text-red-500 font-medium">{errors.ticket_count as string}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mx-5 my-4 flex gap-2.5 bg-[hsl(181_100%_9%/0.04)] border border-[hsl(181_100%_9%/0.07)] rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-[hsl(181_100%_9%/0.4)] text-sm flex-shrink-0 mt-0.5">info</span>
            <p className="text-xs text-[hsl(181_100%_9%/0.55)] leading-relaxed">
              <span className="font-bold text-[hsl(181_100%_9%)]">Ticket Allotment: </span>
              Tickets will be allotted prior to the event and the details will be sent to your registered email or phone number.
            </p>
          </div>

          {serverError && (
            <p className="mx-5 mb-4 text-xs text-red-500 font-semibold bg-red-50 rounded-xl px-3 py-2.5">
              {serverError}
            </p>
          )}

          <div className="px-5 pb-5">
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-[hsl(181_100%_9%)] text-white font-bold text-sm hover:bg-[hsl(181_100%_12%)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-[hsl(181_100%_9%/0.15)] disabled:opacity-60">
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                  Proceed to Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {step === "payment" && (
        <PaymentModal
          ticketType={ticketType}
          ticketCount={form.ticket_count}
          bookingId={bookingId}
          phone={form.phone}
          email={form.email}
          onSuccess={handlePaymentSuccess}
          onClose={() => setStep("form")}
        />
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[hsl(181_5%_97%)]" />}>
      <BookingPageInner />
    </Suspense>
  );
}
