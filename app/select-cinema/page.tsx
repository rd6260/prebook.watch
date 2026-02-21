"use client";

import Navbar from "@/components/Navbar";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ShowTime = {
  time: string;
  seatsLeft: number;
  totalSeats: number;
};

type Cinema = {
  name: string;
  chain: "PVR" | "INOX" | "Cinepolis" | "Phoenix" | "Other";
  shows: ShowTime[];
};

// ─── Data ─────────────────────────────────────────────────────────────────────

export const cities: Record<string, Cinema[]> = {
  Bhubaneswar: [
    {
      name: "Cinepolis: Nexus Esplanade",
      chain: "Cinepolis",
      shows: [
        { time: "10:00 AM", seatsLeft: 120, totalSeats: 150 },
        { time: "1:30 PM",  seatsLeft: 98,  totalSeats: 150 },
        { time: "4:45 PM",  seatsLeft: 42,  totalSeats: 150 },
        { time: "8:00 PM",  seatsLeft: 11,  totalSeats: 150 },
      ],
    },
    {
      name: "PVR Utkal Kanika Galleria",
      chain: "PVR",
      shows: [
        { time: "9:30 AM",  seatsLeft: 200, totalSeats: 200 },
        { time: "12:45 PM", seatsLeft: 145, totalSeats: 200 },
        { time: "3:30 PM",  seatsLeft: 60,  totalSeats: 200 },
        { time: "7:15 PM",  seatsLeft: 18,  totalSeats: 200 },
        { time: "10:30 PM", seatsLeft: 180, totalSeats: 200 },
      ],
    },
    {
      name: "INOX DN Regalia Mall",
      chain: "INOX",
      shows: [
        { time: "11:00 AM", seatsLeft: 130, totalSeats: 160 },
        { time: "2:30 PM",  seatsLeft: 90,  totalSeats: 160 },
        { time: "6:00 PM",  seatsLeft: 35,  totalSeats: 160 },
        { time: "9:15 PM",  seatsLeft: 140, totalSeats: 160 },
      ],
    },
    {
      name: "INOX BMC Bhawani Mall",
      chain: "INOX",
      shows: [
        { time: "10:30 AM", seatsLeft: 100, totalSeats: 120 },
        { time: "2:00 PM",  seatsLeft: 44,  totalSeats: 120 },
        { time: "5:30 PM",  seatsLeft: 110, totalSeats: 120 },
        { time: "9:00 PM",  seatsLeft: 8,   totalSeats: 120 },
      ],
    },
    {
      name: "INOX Symphony Mall",
      chain: "INOX",
      shows: [
        { time: "11:30 AM", seatsLeft: 115, totalSeats: 140 },
        { time: "3:00 PM",  seatsLeft: 130, totalSeats: 140 },
        { time: "6:45 PM",  seatsLeft: 50,  totalSeats: 140 },
        { time: "10:00 PM", seatsLeft: 125, totalSeats: 140 },
      ],
    },
  ],
  Mumbai: [
    {
      name: "INOX RCity Ghatkopar",
      chain: "INOX",
      shows: [
        { time: "10:15 AM", seatsLeft: 180, totalSeats: 200 },
        { time: "1:30 PM",  seatsLeft: 95,  totalSeats: 200 },
        { time: "5:00 PM",  seatsLeft: 40,  totalSeats: 200 },
        { time: "8:30 PM",  seatsLeft: 12,  totalSeats: 200 },
      ],
    },
    {
      name: "Cinepolis Seawoods Navi Mumbai",
      chain: "Cinepolis",
      shows: [
        { time: "11:00 AM", seatsLeft: 160, totalSeats: 180 },
        { time: "2:45 PM",  seatsLeft: 55,  totalSeats: 180 },
        { time: "7:00 PM",  seatsLeft: 9,   totalSeats: 180 },
      ],
    },
    {
      name: "Cinepolis Viviana Thane",
      chain: "Cinepolis",
      shows: [
        { time: "10:00 AM", seatsLeft: 140, totalSeats: 160 },
        { time: "1:15 PM",  seatsLeft: 100, totalSeats: 160 },
        { time: "4:30 PM",  seatsLeft: 38,  totalSeats: 160 },
        { time: "8:00 PM",  seatsLeft: 145, totalSeats: 160 },
      ],
    },
  ],
  Bengaluru: [
    {
      name: "Cinepolis Shantiniketan",
      chain: "Cinepolis",
      shows: [
        { time: "10:30 AM", seatsLeft: 120, totalSeats: 150 },
        { time: "2:00 PM",  seatsLeft: 80,  totalSeats: 150 },
        { time: "5:30 PM",  seatsLeft: 28,  totalSeats: 150 },
        { time: "9:00 PM",  seatsLeft: 6,   totalSeats: 150 },
      ],
    },
    {
      name: "PVR Phoenix Whitefield",
      chain: "PVR",
      shows: [
        { time: "9:45 AM",  seatsLeft: 190, totalSeats: 200 },
        { time: "1:00 PM",  seatsLeft: 70,  totalSeats: 200 },
        { time: "4:15 PM",  seatsLeft: 155, totalSeats: 200 },
        { time: "7:30 PM",  seatsLeft: 14,  totalSeats: 200 },
        { time: "10:45 PM", seatsLeft: 185, totalSeats: 200 },
      ],
    },
    {
      name: "INOX Megaplex Mall of Asia",
      chain: "INOX",
      shows: [
        { time: "11:15 AM", seatsLeft: 130, totalSeats: 160 },
        { time: "3:30 PM",  seatsLeft: 45,  totalSeats: 160 },
        { time: "7:45 PM",  seatsLeft: 140, totalSeats: 160 },
      ],
    },
  ],
  Hyderabad: [
    {
      name: "PVR Central Mall",
      chain: "PVR",
      shows: [
        { time: "10:00 AM", seatsLeft: 170, totalSeats: 180 },
        { time: "1:30 PM",  seatsLeft: 60,  totalSeats: 180 },
        { time: "5:00 PM",  seatsLeft: 22,  totalSeats: 180 },
        { time: "8:30 PM",  seatsLeft: 155, totalSeats: 180 },
      ],
    },
    {
      name: "PVR Prism Mall",
      chain: "PVR",
      shows: [
        { time: "11:00 AM", seatsLeft: 110, totalSeats: 140 },
        { time: "2:30 PM",  seatsLeft: 95,  totalSeats: 140 },
        { time: "6:00 PM",  seatsLeft: 30,  totalSeats: 140 },
        { time: "9:30 PM",  seatsLeft: 120, totalSeats: 140 },
      ],
    },
  ],
  Pune: [
    {
      name: "Cinepolis Seasons Mall",
      chain: "Cinepolis",
      shows: [
        { time: "10:30 AM", seatsLeft: 140, totalSeats: 160 },
        { time: "2:15 PM",  seatsLeft: 85,  totalSeats: 160 },
        { time: "6:00 PM",  seatsLeft: 33,  totalSeats: 160 },
        { time: "9:45 PM",  seatsLeft: 150, totalSeats: 160 },
      ],
    },
    {
      name: "INOX Phoenix Marketcity",
      chain: "INOX",
      shows: [
        { time: "11:30 AM", seatsLeft: 175, totalSeats: 180 },
        { time: "3:00 PM",  seatsLeft: 55,  totalSeats: 180 },
        { time: "7:15 PM",  seatsLeft: 16,  totalSeats: 180 },
      ],
    },
  ],
  Gurgaon: [
    {
      name: "PVR MGF Gurgaon",
      chain: "PVR",
      shows: [
        { time: "10:00 AM", seatsLeft: 190, totalSeats: 200 },
        { time: "1:30 PM",  seatsLeft: 110, totalSeats: 200 },
        { time: "5:00 PM",  seatsLeft: 42,  totalSeats: 200 },
        { time: "8:30 PM",  seatsLeft: 9,   totalSeats: 200 },
      ],
    },
  ],
  Surat: [
    {
      name: "PVR Rahul Raj Mall",
      chain: "PVR",
      shows: [
        { time: "11:00 AM", seatsLeft: 120, totalSeats: 150 },
        { time: "2:30 PM",  seatsLeft: 90,  totalSeats: 150 },
        { time: "6:15 PM",  seatsLeft: 38,  totalSeats: 150 },
        { time: "9:45 PM",  seatsLeft: 135, totalSeats: 150 },
      ],
    },
  ],
  Cuttack: [
    {
      name: "INOX Cuttack SGBL Square Mall",
      chain: "INOX",
      shows: [
        { time: "10:30 AM", seatsLeft: 100, totalSeats: 120 },
        { time: "2:00 PM",  seatsLeft: 75,  totalSeats: 120 },
        { time: "5:30 PM",  seatsLeft: 28,  totalSeats: 120 },
        { time: "9:00 PM",  seatsLeft: 5,   totalSeats: 120 },
      ],
    },
  ],
  Sambalpur: [
    {
      name: "The Phoenix Cinema: City Centre Mall",
      chain: "Phoenix",
      shows: [
        { time: "11:00 AM", seatsLeft: 90,  totalSeats: 100 },
        { time: "3:00 PM",  seatsLeft: 60,  totalSeats: 100 },
        { time: "7:00 PM",  seatsLeft: 22,  totalSeats: 100 },
      ],
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAvailability(seatsLeft: number, total: number) {
  const ratio = seatsLeft / total;
  if (ratio > 0.4) return { color: "text-emerald-600", borderSel: "border-emerald-500", bg: "bg-emerald-500" };
  if (ratio > 0.15) return { color: "text-amber-600", borderSel: "border-amber-400", bg: "bg-amber-400" };
  return { color: "text-red-600", borderSel: "border-red-400", bg: "bg-red-400" };
}

const chainDot: Record<string, string> = {
  PVR: "bg-red-500",
  INOX: "bg-blue-500",
  Cinepolis: "bg-amber-500",
  Phoenix: "bg-violet-500",
  Other: "bg-slate-400",
};

// ─── Cinema Row ───────────────────────────────────────────────────────────────

function CinemaRow({ cinema }: { cinema: Cinema }) {
  const [selected, setSelected] = useState<ShowTime | null>(null);

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
      selected ? "border-[hsl(181_100%_9%)] shadow-xl shadow-[hsl(181_100%_9%/0.08)]" : "border-transparent shadow-sm hover:shadow-md"
    }`}>
      {/* Main row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">

        {/* Cinema name */}
        <div className="flex items-center gap-3 sm:w-56 sm:flex-shrink-0">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${chainDot[cinema.chain] ?? chainDot.Other}`} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.35)] leading-none mb-0.5">
              {cinema.chain}
            </p>
            <p className="font-bold text-[hsl(181_100%_9%)] text-sm leading-snug">
              {cinema.name.replace(/^(PVR|INOX|Cinepolis|The Phoenix Cinema)[\s:]*/i, "")}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-10 bg-[hsl(181_100%_9%/0.08)]" />

        {/* Time slots */}
        <div className="flex flex-wrap gap-2 flex-1">
          {cinema.shows.map((show, i) => {
            const avail = getAvailability(show.seatsLeft, show.totalSeats);
            const isSelected = selected === show;
            return (
              <button
                key={i}
                onClick={() => setSelected(isSelected ? null : show)}
                className={`flex flex-col items-center px-4 py-2.5 rounded-xl border-2 font-bold transition-all duration-150 min-w-[80px] ${
                  isSelected
                    ? `${avail.borderSel} ${avail.bg} text-white shadow-md scale-105`
                    : "border-[hsl(181_100%_9%/0.12)] text-[hsl(181_100%_9%)] hover:border-[hsl(181_100%_9%/0.35)] hover:shadow-sm bg-white"
                }`}
              >
                <span className="text-base leading-none">{show.time}</span>
                <span className={`text-[10px] font-semibold mt-1.5 leading-none ${isSelected ? "text-white/80" : avail.color}`}>
                  {show.seatsLeft} seats left
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirm bar — slides in when a slot is selected */}
      {selected && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 bg-[hsl(181_100%_9%/0.03)] border-t-2 border-[hsl(181_100%_9%/0.06)]">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.35)] mb-0.5">Booking</p>
            <p className="font-bold text-[hsl(181_100%_9%)] text-sm">
              {cinema.name} &nbsp;·&nbsp; {selected.time}
            </p>
            <p className={`text-xs mt-0.5 font-semibold ${getAvailability(selected.seatsLeft, selected.totalSeats).color}`}>
              {selected.seatsLeft} seats remaining
            </p>
          </div>
          <button className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(181_100%_9%)] text-white rounded-xl font-bold hover:bg-[hsl(181_100%_12%)] transition-colors text-sm shadow-lg shadow-[hsl(181_100%_9%/0.2)]">
            <span className="material-symbols-outlined text-base">chair</span>
            Select Seats
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Date Selector ────────────────────────────────────────────────────────────

function DateSelector() {
  const [active, setActive] = useState(0);
  const days = ["Today", "Tomorrow", "Sat 22", "Sun 23", "Mon 24"];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      {days.map((d, i) => (
        <button
          key={d}
          onClick={() => setActive(i)}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            active === i
              ? "bg-[hsl(181_100%_9%)] text-white shadow-md"
              : "bg-white text-[hsl(181_100%_9%/0.55)] hover:bg-[hsl(181_100%_9%/0.06)]"
          }`}
        >
          {d}
        </button>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function SelectCinemaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cityName = searchParams.get("city") ?? "";
  const [filterChain, setFilterChain] = useState("All");

  const cinemas = cities[cityName] ?? [];
  const chains = ["All", ...Array.from(new Set(cinemas.map((c) => c.chain)))];
  const filtered = filterChain === "All" ? cinemas : cinemas.filter((c) => c.chain === filterChain);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[hsl(180_88%_90%)] text-[hsl(185_100%_1%)] font-[Be_Vietnam_Pro,sans-serif]">
      <Navbar />

      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-[hsl(180_88%_90%)] bg-opacity-95 backdrop-blur-md border-b border-[hsl(181_54%_37%/0.1)] px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push("/select-city")}
            className="flex items-center gap-1.5 text-sm font-semibold text-[hsl(181_100%_9%/0.5)] hover:text-[hsl(181_100%_9%)] transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span className="hidden sm:inline">Change City</span>
          </button>
          <span className="text-[hsl(181_100%_9%/0.2)]">/</span>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img
              src="/movie_posters/bindusagar_poster.webp"
              alt="Bindusagar"
              className="w-7 h-9 object-cover object-top rounded flex-shrink-0"
            />
            <div className="min-w-0">
              <span className="font-black text-[hsl(181_100%_9%)] text-sm block leading-tight truncate">Bindusagar</span>
              <span className="text-xs text-[hsl(181_100%_9%/0.45)]">{cityName}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-yellow-400 text-[hsl(181_100%_6%)] px-2 py-1 rounded-lg font-black text-xs flex-shrink-0">
            <span className="material-symbols-outlined text-sm">star</span>8.9
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-[hsl(181_100%_9%)] tracking-tight mb-1">
            Cinemas in {cityName || "your city"}
          </h1>
          <p className="text-[hsl(181_100%_9%/0.5)] text-sm">
            {cinemas.length > 0
              ? `${cinemas.length} venue${cinemas.length > 1 ? "s" : ""} · Tap a time to book`
              : "No screenings found for this city"}
          </p>
        </div>

        {cinemas.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-7xl text-[hsl(181_100%_9%/0.15)] block mb-4">theaters</span>
            <p className="text-xl font-bold text-[hsl(181_100%_9%/0.35)] mb-2">No cinemas listed yet</p>
            <p className="text-[hsl(181_100%_9%/0.3)] mb-8">We're working on bringing Bindusagar to {cityName || "your city"}.</p>
            <button
              onClick={() => router.push("/select-city")}
              className="px-6 py-3 bg-[hsl(181_100%_9%)] text-white rounded-xl font-bold hover:bg-[hsl(181_100%_12%)] transition-colors"
            >
              ← Choose a Different City
            </button>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <DateSelector />
              {chains.length > 2 && (
                <div className="flex gap-2 overflow-x-auto pb-1 sm:ml-auto" style={{ scrollbarWidth: "none" }}>
                  {chains.map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setFilterChain(ch)}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                        filterChain === ch
                          ? "border-[hsl(181_100%_9%)] bg-[hsl(181_100%_9%)] text-white"
                          : "border-transparent bg-white text-[hsl(181_100%_9%/0.55)] hover:border-[hsl(181_100%_9%/0.2)]"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cinema list */}
            <div className="space-y-3">
              {filtered.map((cinema) => (
                <CinemaRow key={cinema.name} cinema={cinema} />
              ))}
            </div>

            <p className="mt-10 text-sm text-[hsl(181_100%_9%/0.35)] text-center">
              Don&apos;t see your cinema?{" "}
              <a href="#" className="underline hover:text-[hsl(181_100%_9%)] transition-colors">
                Request a new venue
              </a>
            </p>
          </>
        )}
      </main>

      <footer className="mt-auto py-8 px-6 md:px-20 border-t border-[hsl(181_54%_37%/0.08)] flex flex-col md:flex-row justify-between items-center gap-4 text-[hsl(181_100%_9%/0.35)] text-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base">copyright</span>
          <span>2026 Prebook.watch. All rights reserved.</span>
        </div>
        <div className="flex gap-6">
          {["Privacy Policy", "Terms of Service", "Help Center"].map((item) => (
            <a key={item} href="#" className="hover:text-[hsl(181_100%_9%)] transition-colors">{item}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default function SelectCinemaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[hsl(180_88%_90%)] flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-[hsl(181_100%_9%/0.3)] animate-spin">progress_activity</span>
      </div>
    }>
      <SelectCinemaContent />
    </Suspense>
  );
}
