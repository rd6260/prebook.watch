"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  return (
    <section className="bg-[hsl(181_100%_9%)] rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
      <div className="max-w-md text-center md:text-left">
        <h3 className="text-3xl font-black mb-4">Never Miss a Premiere</h3>
        <p className="text-slate-300 font-light">
          Sign up for our weekly movie picks, trailer alerts, and exclusive early
          booking offers.
        </p>
      </div>
      <div className="flex w-full max-w-md gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 rounded-lg border-none bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/20 outline-none"
        />
        <button className="px-6 py-3 bg-white text-[hsl(181_100%_9%)] font-bold rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap">
          Subscribe
        </button>
      </div>
    </section>
  );
}
