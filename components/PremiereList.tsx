"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Show, getCityByDisplayName } from "@/lib/premiere-data";

// ---------------------------------------------------------------------------
// Booking Block Config – set to false to re-enable normal booking
// ---------------------------------------------------------------------------
const BOOKING_BLOCKED = true;
const BOOKING_BLOCKED_MESSAGE =
  "Booking is temporarily unavailable. Please try again later.";

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface PremiereCardProps {
  show: Show;
  cityName: string;
  onBook: () => void;
}

function PremiereCard({ show, cityName, onBook }: PremiereCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[hsl(181_100%_9%/0.08)] shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 pt-4 pb-5 flex flex-col flex-1">

        {/* Header row: label pill + dot */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.4)]">
            {show.label}
          </span>
          <span className="w-2 h-2 rounded-full bg-[hsl(181_100%_9%/0.15)]" />
        </div>

        {/* Title */}
        <h3 className="font-black text-[hsl(181_100%_9%)] text-lg leading-tight mb-0.5">
          Bindusagar — {show.label}
        </h3>
        <p className="text-sm font-semibold text-[hsl(181_100%_9%/0.5)] mb-1">
          {cityName}
        </p>

        {/* Description */}
        <div className="mb-4 flex items-start gap-1.5">
          <span
            className="material-symbols-outlined mr-2 text-sm flex-shrink-0 text-[hsl(181_100%_9%/0.45)]"
            style={{ lineHeight: "1.4" }}
          >
            {show.icon}
          </span>
          <p className="text-xs font-semibold text-[hsl(181_100%_9%/0.45)] leading-relaxed">
            {show.description}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-[hsl(181_100%_9%/0.07)] mb-4" />

        {/* Date + time */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[hsl(181_100%_9%/0.35)] mb-1">
              Date
            </p>
            <p className="text-sm font-bold text-[hsl(181_100%_9%)]">
              {show.date}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-wider text-[hsl(181_100%_9%/0.35)] mb-1">
              Time
            </p>
            <p className="text-sm font-bold text-[hsl(181_100%_9%)]">
              {show.time}
            </p>
          </div>
        </div>

        {/* Book Now */}
        <button
          onClick={onBook}
          className="mt-5 w-full py-3 rounded-xl font-bold text-sm bg-[hsl(181_100%_9%)] text-white hover:bg-[hsl(181_100%_12%)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-[hsl(181_100%_9%/0.15)]"
        >
          <span className="material-symbols-outlined text-base">
            confirmation_number
          </span>
          Prebook Now
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

interface PremiereListProps {
  /** Pass the city key (case-insensitive), e.g. "Bhubaneswar" or "bhubaneswar" */
  cityName: string;
}

export default function PremiereList({ cityName }: PremiereListProps) {
  const router = useRouter();
  const [showBlockedPopup, setShowBlockedPopup] = useState(false);

  const city = getCityByDisplayName(cityName);

  if (!city) {
    // Graceful fallback if city isn't configured yet
    return (
      <p className="mt-5 text-sm text-[hsl(181_100%_9%/0.5)]">
        No screenings configured for <strong>{cityName}</strong> yet.
      </p>
    );
  }

  function handleBook(show: Show) {
    if (BOOKING_BLOCKED) {
      setShowBlockedPopup(true);
      return;
    }
    router.push(
      `/book?type=${encodeURIComponent(show.type)}&city=${encodeURIComponent(city!.displayName)}`
    );
  }

  const { displayName, shows } = city;
  const isOddCount = shows.length % 2 !== 0;

  return (
    <div className="mt-5 w-full max-w-7xl mx-auto sm:px-2">

      {/* ── Booking‑blocked popup overlay ── */}
      {showBlockedPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowBlockedPopup(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl mx-4 max-w-sm w-full p-6 text-center animate-[popIn_0.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="material-symbols-outlined text-4xl text-[hsl(181_100%_9%/0.6)] mb-3 block">
              event_busy
            </span>
            <h3 className="text-lg font-black text-[hsl(181_100%_9%)] mb-2">
              Please try later
            </h3>
            <p className="text-sm text-[hsl(181_100%_9%/0.6)] leading-relaxed mb-5">
              {BOOKING_BLOCKED_MESSAGE}
            </p>
            <button
              onClick={() => setShowBlockedPopup(false)}
              className="w-full py-2.5 rounded-xl font-bold text-sm bg-[hsl(181_100%_9%)] text-white hover:bg-[hsl(181_100%_12%)] active:scale-[0.98] transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Section heading */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.4)]">
            Screenings in
          </p>
          <h2 className="text-xl font-black text-[hsl(181_100%_9%)] leading-tight">
            {displayName}
          </h2>
        </div>
      </div>

      {/* Cards grid — 2 columns on sm+; last card in an odd list stays narrow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {shows.map((show, i) => {
          const isLastOdd = isOddCount && i === shows.length - 1;
          return (
            <div
              key={`${show.type}-${i}`}
              className={isLastOdd ? "sm:col-span-2 sm:max-w-sm" : ""}
            >
              <PremiereCard
                show={show}
                cityName={displayName}
                onBook={() => handleBook(show)}
              />
            </div>
          );
        })}
      </div>

      {/* Venue note */}
      <div className="mt-4 flex gap-3 bg-[hsl(181_100%_9%/0.04)] border border-[hsl(181_100%_9%/0.08)] rounded-xl px-4 py-3.5">
        <span className="material-symbols-outlined text-[hsl(181_100%_9%/0.4)] text-base flex-shrink-0 mt-0.5">
          info
        </span>
        <p className="text-xs text-[hsl(181_100%_9%/0.6)] leading-relaxed">
          <span className="font-bold text-[hsl(181_100%_9%)]">Note:</span>{" "}
          Venue and other details will be sent to your registered mobile number
          two days before the premiere.
        </p>
      </div>
    </div>
  );
}
