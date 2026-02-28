"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ─── Config ────────────────────────────────────────────────────────────────
const MAX_TICKETS = 25;

const TICKET_PRICES: Record<string, number> = {
  Industry: 400,
  Public: 350,
};

const PREMIERE_DATES: Record<string, string> = {
  Industry: "Wednesday, April 8",
  Public: "Thursday, April 9",
};

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
      return {
        label: p.card_network ? `${p.card_network} Card` : "Card",
        sub: null,
      };
    case "upi":
      return {
        label: "UPI",
        sub: p.vpa ?? null,
      };
    case "netbanking":
      return {
        label: "Net Banking",
        sub: p.bank ?? null,
      };
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
  const router = useRouter();
  const premiereDate = PREMIERE_DATES[details.ticketType] ?? "—";
  const paymentLabel = details.paymentDetails
    ? formatPaymentMethod(details.paymentDetails)
    : null;

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
      <div className="w-full max-w-md">
        {/* Icon + heading */}
        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-emerald-600">check_circle</span>
          </div>
          <h1 className="font-black text-[hsl(181_100%_9%)] text-2xl mb-1">Booking Confirmed!</h1>
          <p className="text-sm text-[hsl(181_100%_9%/0.5)] leading-relaxed">
            Your tickets have been booked successfully. A confirmation will be sent to your registered contact.
          </p>
        </div>

        {/* Booking summary card */}
        <div className="bg-white rounded-2xl border border-[hsl(181_100%_9%/0.08)] shadow-sm overflow-hidden mb-4">
          {/* Card header */}
          <div className="bg-[hsl(181_100%_9%)] px-5 py-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-white/70 text-lg">confirmation_number</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Booking Details</p>
              <p className="text-white font-black text-base leading-tight">
                Bindusagar — {details.ticketType} Premiere
              </p>
            </div>
          </div>

          {/* Rows */}
          <div className="px-5 pt-1 pb-2">
            <Row icon="person"               label="Name"               value={details.name} />
            <Row icon="mail"                 label="Email"              value={details.email} />
            <Row icon="smartphone"           label="Mobile"             value={`+91 ${details.phone}`} />
            <Row icon="event"                label="Premiere Date"      value={premiereDate} />
            <Row icon="confirmation_number"  label="Number of Tickets"  value={`${details.ticketCount} ticket${details.ticketCount > 1 ? "s" : ""}`} />
            <Row icon="movie"                label="Ticket Type"        value={`${details.ticketType} Premiere`} />
            <Row icon="schedule"             label="Booked At"          value={formatDateTime(details.bookedAt)} />
          </div>

          {/* Amount + Payment mode footer */}
          <div className="mx-4 mb-4 rounded-xl bg-[hsl(181_100%_9%/0.04)] border border-[hsl(181_100%_9%/0.08)] px-4 py-3.5 flex items-center justify-between gap-3">
            {/* Amount */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.4)] mb-0.5">
                Amount Paid
              </p>
              <p className="text-2xl font-black text-[hsl(181_100%_9%)]">
                ₹{details.totalAmount.toLocaleString("en-IN")}
              </p>
            </div>

            {/* Payment mode */}
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.4)] mb-1">
                Payment Mode
              </p>
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-black px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-sm">verified</span>
                {paymentLabel ? paymentLabel.label : "Online"}
              </span>
              {/* Sub-label: VPA for UPI, bank for netbanking, etc. */}
              {paymentLabel?.sub && (
                <p className="text-[10px] text-[hsl(181_100%_9%/0.4)] font-medium mt-1">
                  {paymentLabel.sub}
                </p>
              )}
              {/* Payment ID */}
              {details.paymentId && (
                <p className="text-[10px] text-[hsl(181_100%_9%/0.3)] font-medium mt-1 font-mono">
                  {details.paymentId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Venue note */}
        <div className="flex gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
          <span className="material-symbols-outlined text-amber-500 text-base flex-shrink-0 mt-0.5">info</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold">Note:</span> Venue and seat allotment details will be sent to your registered mobile number two days before the premiere.
          </p>
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full py-3.5 rounded-xl bg-[hsl(181_100%_9%)] text-white text-sm font-bold hover:bg-[hsl(181_100%_12%)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-[hsl(181_100%_9%/0.15)]"
        >
          <span className="material-symbols-outlined text-base">home</span>
          Back to Home
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
function BookingPageInner() {
  const searchParams = useSearchParams();
  const ticketType = (searchParams.get("type") ?? "Public") as "Public" | "Industry";

  const supabase = createClient();

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

  const pricePerTicket = TICKET_PRICES[ticketType] ?? 350;
  const [city, setCity] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("preferredCity");
    if (!stored) {
      router.replace("/");
    } else {
      setCity(stored);
    }
  }, [router]);

  function validate(): boolean {
    const e: Partial<Record<keyof BookingForm, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = "Enter a valid 10-digit mobile number";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (form.ticket_count < 1 || form.ticket_count > MAX_TICKETS) {
      e.ticket_count = `Between 1 and ${MAX_TICKETS} tickets`;
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
    // Fetch actual payment method from Razorpay via our server route
    let paymentDetails: PaymentDetails | null = null;
    try {
      const res = await fetch(`/api/getPaymentDetails?payment_id=${paymentId}`);
      if (res.ok) paymentDetails = await res.json();
    } catch {
      // Non-critical — success screen still shows without method details
    }

    setSuccessDetails({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      ticketType,
      ticketCount: form.ticket_count,
      totalAmount: pricePerTicket * form.ticket_count,
      bookedAt: new Date(),
      paymentId,
      paymentDetails,
    });
    setStep("success");
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
              Bindusagar
            </p>
            <h1 className="text-base font-black text-[hsl(181_100%_9%)] leading-tight">
              {ticketType} Premiere · Book Tickets
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Price badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-[hsl(181_100%_9%)] text-white text-xs font-black px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-sm">confirmation_number</span>
            ₹{pricePerTicket} per ticket
          </span>
          <span className="text-xs text-[hsl(181_100%_9%/0.4)] font-medium">
            Max {MAX_TICKETS} tickets per booking
          </span>
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
                    onClick={() => setForm((f) => ({ ...f, ticket_count: Math.min(MAX_TICKETS, f.ticket_count + 1) }))}
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
