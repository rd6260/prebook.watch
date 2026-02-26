"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ─── Config ────────────────────────────────────────────────────────────────
const MAX_TICKETS = 25;

const TICKET_PRICES: Record<string, number> = {
  Industry: 400,
  Public: 350,
};

// ─── Types ──────────────────────────────────────────────────────────────────
type BookingForm = {
  name: string;
  phone: string;
  email: string;
  ticket_count: number;
};

type BookingStep = "form" | "payment" | "success";

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
        className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold text-[hsl(181_100%_9%)] placeholder:text-[hsl(181_100%_9%/0.25)] bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(181_100%_9%/0.15)] transition-all ${error
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
  onSuccess,
  onClose,
}: {
  ticketType: string;
  ticketCount: number;
  bookingId: string;
  phone: string;
  onSuccess: () => void;
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
            onSuccess();
          } else {
            setError("Payment verification failed. Contact support.");
          }
        },
        prefill: { contact: phone },
        theme: { color: "#012d2f" },
        modal: {
          ondismiss: () => setLoading(false),
        },
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
        {/* Header */}
        <div className="bg-[hsl(181_100%_9%)] px-6 py-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">
            Order Summary
          </p>
          <h2 className="text-white font-black text-xl">Complete Payment</h2>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Breakdown */}
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

          {/* Note */}
          <div className="flex gap-2 bg-[hsl(181_100%_9%/0.04)] rounded-xl px-3 py-2.5">
            <span className="material-symbols-outlined text-sm text-[hsl(181_100%_9%/0.4)] flex-shrink-0 mt-0.5">
              info
            </span>
            <p className="text-xs text-[hsl(181_100%_9%/0.55)] leading-relaxed">
              Tickets will be allotted prior to the event. Details will be sent to your registered
              email or phone number.
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-semibold bg-red-50 rounded-xl px-3 py-2.5">
              {error}
            </p>
          )}

          {/* Buttons */}
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
function SuccessScreen({ ticketType }: { ticketType: string }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[hsl(181_5%_97%)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <span className="material-symbols-outlined text-3xl text-emerald-600">check_circle</span>
        </div>
        <h1 className="font-black text-[hsl(181_100%_9%)] text-2xl mb-2">Booking Confirmed!</h1>
        <p className="text-sm text-[hsl(181_100%_9%/0.55)] mb-6 leading-relaxed">
          Your {ticketType} Premiere tickets have been booked. Ticket details will be sent to your
          registered email or phone number prior to the event.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 rounded-xl bg-[hsl(181_100%_9%)] text-white text-sm font-bold hover:bg-[hsl(181_100%_12%)] transition-all"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function BookingPage() {
  const searchParams = useSearchParams();
  const ticketType = (searchParams.get("type") ?? "Public") as "Public" | "Industry";

  const supabase = createClient();

  const [form, setForm] = useState<BookingForm>({
    name: "",
    phone: "",
    email: "",
    ticket_count: 1,
  });
  const [errors, setErrors] = useState<Partial<BookingForm>>({});
  const [step, setStep] = useState<BookingStep>("form");
  const [bookingId, setBookingId] = useState<string>("");
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
    if (form.ticket_count < 1 || form.ticket_count > MAX_TICKETS)
      e.ticket_count = `Between 1 and ${MAX_TICKETS} tickets`;
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
        city: city,
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

  if (city === null) return null; // waiting for redirect or city resolution
  if (step === "success") return <SuccessScreen ticketType={ticketType} />;

  return (
    <div className="min-h-screen bg-[hsl(181_5%_97%)]">
      {/* Top bar */}
      <div className="bg-white border-b border-[hsl(181_100%_9%/0.08)] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[hsl(181_100%_9%/0.06)] transition-all"
          >
            <span className="material-symbols-outlined text-lg text-[hsl(181_100%_9%)]">
              arrow_back
            </span>
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
            <p className="text-xs text-[hsl(181_100%_9%/0.45)] mb-5">
              Fill in your information to reserve seats
            </p>
            <div className="flex flex-col gap-4">
              <InputField
                label="Full Name"
                id="name"
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="Enter your full name"
                error={errors.name as string | undefined}
                required
              />
              <InputField
                label="Mobile Number"
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                placeholder="10-digit mobile number"
                error={errors.phone as string | undefined}
                required
              />
              <InputField
                label="Email Address"
                id="email"
                type="email"
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                placeholder="you@example.com"
                error={errors.email as string | undefined}
                required
              />

              {/* Ticket count stepper */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.45)]">
                  Number of Tickets <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, ticket_count: Math.max(1, f.ticket_count - 1) }))}
                    className="w-10 h-10 rounded-xl border border-[hsl(181_100%_9%/0.12)] flex items-center justify-center text-[hsl(181_100%_9%)] hover:bg-[hsl(181_100%_9%/0.05)] active:scale-95 transition-all font-bold text-lg"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-black text-[hsl(181_100%_9%)] text-lg tabular-nums">
                    {form.ticket_count}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, ticket_count: Math.min(MAX_TICKETS, f.ticket_count + 1) }))
                    }
                    className="w-10 h-10 rounded-xl border border-[hsl(181_100%_9%/0.12)] flex items-center justify-center text-[hsl(181_100%_9%)] hover:bg-[hsl(181_100%_9%/0.05)] active:scale-95 transition-all font-bold text-lg"
                  >
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

          {/* Ticket info note */}
          <div className="mx-5 my-4 flex gap-2.5 bg-[hsl(181_100%_9%/0.04)] border border-[hsl(181_100%_9%/0.07)] rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-[hsl(181_100%_9%/0.4)] text-sm flex-shrink-0 mt-0.5">
              info
            </span>
            <p className="text-xs text-[hsl(181_100%_9%/0.55)] leading-relaxed">
              <span className="font-bold text-[hsl(181_100%_9%)]">Ticket Allotment: </span>
              Tickets will be allotted prior to the event and the details will be sent to your
              registered email or phone number.
            </p>
          </div>

          {serverError && (
            <p className="mx-5 mb-4 text-xs text-red-500 font-semibold bg-red-50 rounded-xl px-3 py-2.5">
              {serverError}
            </p>
          )}

          <div className="px-5 pb-5">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-[hsl(181_100%_9%)] text-white font-bold text-sm hover:bg-[hsl(181_100%_12%)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-[hsl(181_100%_9%/0.15)] disabled:opacity-60"
            >
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

      {/* Payment modal */}
      {step === "payment" && (
        <PaymentModal
          ticketType={ticketType}
          ticketCount={form.ticket_count}
          bookingId={bookingId}
          phone={form.phone}
          onSuccess={() => setStep("success")}
          onClose={() => setStep("form")}
        />
      )}
    </div>
  );
}
