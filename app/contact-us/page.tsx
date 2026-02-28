"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

type SubjectOption = {
  value: string;
  label: string;
  icon: string;
};

const SUBJECT_OPTIONS: SubjectOption[] = [
  { value: "ticket_booking_error", label: "Ticket Booking Error",  icon: "error"         },
  { value: "new_film_listing",     label: "New Film Listing",      icon: "movie"          },
  { value: "new_event_listing",    label: "New Event Listing",     icon: "event"          },
  { value: "partnerships",         label: "Partnerships",          icon: "handshake"      },
  { value: "media_enquiry",        label: "Media Enquiry",         icon: "campaign"       },
];

type ContactForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FormErrors = Partial<Record<keyof ContactForm, string>>;

// ─── Sub-components ──────────────────────────────────────────────────────────

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
  value: string;
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

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ name, onBack }: { name: string; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-4xl text-emerald-600">mark_email_read</span>
      </div>
      <h2 className="font-black text-[hsl(181_100%_9%)] text-2xl mb-2">
        Message Received!
      </h2>
      <p className="text-sm text-[hsl(181_100%_9%/0.55)] leading-relaxed max-w-xs mb-8">
        Thanks, {name.split(" ")[0]}. We've got your message and will get back
        to you at the earliest opportunity.
      </p>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[hsl(181_100%_9%/0.15)] text-sm font-bold text-[hsl(181_100%_9%)] hover:bg-[hsl(181_100%_9%/0.04)] transition-all"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to Home
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const router = useRouter();

  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function set(field: keyof ContactForm) {
    return (v: string) => {
      setForm((f) => ({ ...f, [field]: v }));
      if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    };
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim())    e.name    = "Your name is required";
    if (!form.email.trim())   e.email   = "Your email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.subject)        e.subject = "Please select a subject";
    if (!form.message.trim()) e.message = "Please write a brief message";
    else if (form.message.trim().length < 10) e.message = "Message is too short — please add more detail";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    setServerError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setSubmitted(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedOption = SUBJECT_OPTIONS.find((o) => o.value === form.subject);

  return (
    <div className="min-h-screen bg-[hsl(181_5%_97%)]">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-[hsl(181_100%_9%/0.08)] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[hsl(181_100%_9%/0.06)] transition-all"
          >
            <span className="material-symbols-outlined text-lg text-[hsl(181_100%_9%)]">arrow_back</span>
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.4)]">
              Bindusagar
            </p>
            <h1 className="text-base font-black text-[hsl(181_100%_9%)] leading-tight">
              Contact Us
            </h1>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {submitted ? (
          <SuccessScreen name={form.name} onBack={() => router.push("/")} />
        ) : (
          <>
            {/* Header card */}
            <div className="bg-[hsl(181_100%_9%)] rounded-2xl px-5 py-5 mb-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-xl">mail</span>
              </div>
              <div>
                <h2 className="font-black text-white text-lg leading-tight mb-0.5">
                  Get in Touch
                </h2>
                <p className="text-sm text-white/60 leading-relaxed">
                  Have a question, partnership idea, or just want to say hello?
                  We'd love to hear from you.
                </p>
              </div>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-2xl border border-[hsl(181_100%_9%/0.08)] shadow-sm overflow-hidden">
              <div className="px-5 pt-5 pb-1 flex flex-col gap-4">

                {/* Name */}
                <InputField
                  label="Your Name"
                  id="name"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Full name"
                  error={errors.name}
                  required
                />

                {/* Email */}
                <InputField
                  label="Email Address"
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                  error={errors.email}
                  required
                />

                {/* Subject dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="subject"
                    className="text-[11px] font-black uppercase tracking-widest text-[hsl(181_100%_9%)]"
                  >
                    Subject <span className="text-red-400">*</span>
                  </label>

                  {/* Custom styled select wrapper */}
                  <div className="relative">
                    {/* Leading icon */}
                    {selectedOption && (
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-[hsl(181_100%_9%/0.4)] pointer-events-none">
                        {selectedOption.icon}
                      </span>
                    )}
                    <select
                      id="subject"
                      value={form.subject}
                      onChange={(e) => set("subject")(e.target.value)}
                      className={`w-full appearance-none px-4 py-3 rounded-xl border text-sm font-semibold text-[hsl(181_100%_9%)] bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(181_100%_9%/0.15)] transition-all cursor-pointer ${
                        selectedOption ? "pl-10" : ""
                      } ${
                        errors.subject
                          ? "border-red-300 focus:border-red-400"
                          : "border-[hsl(181_100%_9%/0.12)] focus:border-[hsl(181_100%_9%/0.3)]"
                      } ${!form.subject ? "text-[hsl(181_100%_9%/0.35)]" : ""}`}
                    >
                      <option value="" disabled>
                        Select a subject…
                      </option>
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {/* Chevron */}
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-base text-[hsl(181_100%_9%/0.4)] pointer-events-none">
                      expand_more
                    </span>
                  </div>
                  {errors.subject && (
                    <p className="text-xs text-red-500 font-medium">{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="message"
                    className="text-[11px] font-black uppercase tracking-widest text-[hsl(181_100%_9%)]"
                  >
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    value={form.message}
                    onChange={(e) => set("message")(e.target.value)}
                    placeholder="Write in brief your reason to get in touch…"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold text-[hsl(181_100%_9%)] placeholder:text-[hsl(181_100%_9%/0.25)] bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(181_100%_9%/0.15)] transition-all resize-none leading-relaxed ${
                      errors.message
                        ? "border-red-300 focus:border-red-400"
                        : "border-[hsl(181_100%_9%/0.12)] focus:border-[hsl(181_100%_9%/0.3)]"
                    }`}
                  />
                  <div className="flex items-start justify-between">
                    {errors.message ? (
                      <p className="text-xs text-red-500 font-medium">{errors.message}</p>
                    ) : (
                      <span />
                    )}
                    <p className={`text-[10px] font-bold tabular-nums ${
                      form.message.length > 500
                        ? "text-amber-500"
                        : "text-[hsl(181_100%_9%/0.3)]"
                    }`}>
                      {form.message.length} / 500
                    </p>
                  </div>
                </div>
              </div>

              {/* Privacy note */}
              <div className="mx-5 my-3 flex gap-2.5 bg-[hsl(181_100%_9%/0.04)] border border-[hsl(181_100%_9%/0.07)] rounded-xl px-4 py-3">
                <span className="material-symbols-outlined text-[hsl(181_100%_9%/0.4)] text-sm flex-shrink-0 mt-0.5">
                  lock
                </span>
                <p className="text-xs text-[hsl(181_100%_9%/0.55)] leading-relaxed">
                  Your information is kept private and only used to respond to your enquiry.
                </p>
              </div>

              {/* Server error */}
              {serverError && (
                <div className="mx-5 mb-4 flex gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-red-400 text-sm flex-shrink-0 mt-0.5">
                    error
                  </span>
                  <p className="text-xs text-red-600 font-semibold leading-relaxed">{serverError}</p>
                </div>
              )}

              {/* Submit */}
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
                      Sending…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">send</span>
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
