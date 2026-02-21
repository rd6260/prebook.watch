"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import CityPickerModal from "@/components/CitySelectionComponent";

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

// ─── Chain badge colors ───────────────────────────────────────────────────────

const chainColors: Record<string, { bg: string; text: string }> = {
  PVR:       { bg: "bg-red-600",    text: "text-white" },
  INOX:      { bg: "bg-blue-600",   text: "text-white" },
  Cinepolis: { bg: "bg-amber-500",  text: "text-white" },
  Phoenix:   { bg: "bg-violet-600", text: "text-white" },
  Other:     { bg: "bg-slate-500",  text: "text-white" },
};

function ChainBadge({ chain }: { chain: string }) {
  const c = chainColors[chain] ?? chainColors.Other;
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${c.bg} ${c.text}`}
    >
      <span className="text-[9px] font-black tracking-tight leading-none text-center px-0.5">
        {chain}
      </span>
    </div>
  );
}

// ─── Single Cinema Row ────────────────────────────────────────────────────────

function CinemaRow({ cinema, cityName }: { cinema: Cinema; cityName: string }) {
  const router = useRouter();

  const handleSelectTime = (show: ShowTime) => {
    const params = new URLSearchParams({
      city: cityName,
      cinema: cinema.name,
      time: show.time,
    });
    router.push(`/select-seat?${params.toString()}`);
  };

  const displayName = cinema.name.replace(
    /^(PVR|INOX|Cinepolis|The Phoenix Cinema)[\s:]*/i,
    ""
  );

  return (
    <div className="px-4 py-4 border-b border-[hsl(181_100%_9%/0.07)] last:border-b-0">
      <div className="flex items-center gap-3 mb-3">
        <ChainBadge chain={cinema.chain} />
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.4)] leading-none mb-0.5">
            {cinema.chain}
          </p>
          <p className="font-bold text-[hsl(181_100%_9%)] text-sm leading-snug truncate">
            {displayName}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" style={{ paddingLeft: "52px" }}>
        {cinema.shows.map((show, i) => (
          <button
            key={i}
            onClick={() => handleSelectTime(show)}
            className="px-4 py-2 rounded-lg border-2 border-[hsl(181_100%_9%/0.15)] text-[hsl(181_100%_9%)] font-semibold text-sm bg-white hover:border-[hsl(181_100%_9%)] hover:bg-[hsl(181_100%_9%/0.04)] active:scale-95 transition-all duration-100"
          >
            {show.time}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface CinemaListProps {
  cinemas: Cinema[];
  cityName: string;
}

export default function CinemaList({ cinemas, cityName }: CinemaListProps) {
  const [hasCity, setHasCity] = useState<boolean | null>(null); // null = loading
  const [cityPickerOpen, setCityPickerOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("preferredCity");
    setHasCity(!!stored);

    const handleChange = () => {
      const updated = localStorage.getItem("preferredCity");
      setHasCity(!!updated);
    };
    window.addEventListener("cityChanged", handleChange);
    return () => window.removeEventListener("cityChanged", handleChange);
  }, []);

  // Only visible on mobile (md:hidden) — desktop redirects via the Book Now button on Hero
  // We use a wrapper div with md:hidden to hide on desktop
  return (
    <>
      <CityPickerModal
        isOpen={cityPickerOpen}
        onClose={() => {
          setCityPickerOpen(false);
          const updated = localStorage.getItem("preferredCity");
          setHasCity(!!updated);
        }}
      />

      {/* Hidden on desktop — desktop uses /select-cinema page */}
      <div className="md:hidden">
        {/* Loading skeleton */}
        {hasCity === null ? null : !hasCity ? (
          /* No city preference — prompt user */
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[hsl(181_100%_9%/0.06)] mt-6">
            <span className="material-symbols-outlined text-5xl text-[hsl(181_100%_9%/0.15)] block mb-3">
              location_city
            </span>
            <p className="font-bold text-[hsl(181_100%_9%)] mb-1">Choose your city</p>
            <p className="text-sm text-[hsl(181_100%_9%/0.45)] mb-5">
              Select a city to see cinemas screening near you
            </p>
            <button
              onClick={() => setCityPickerOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(181_100%_9%)] text-white rounded-xl font-bold text-sm hover:bg-[hsl(181_100%_12%)] transition-colors shadow-lg shadow-[hsl(181_100%_9%/0.2)]"
            >
              <span className="material-symbols-outlined text-base">add_location_alt</span>
              Select City
            </button>
          </div>
        ) : cinemas.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm mt-6">
            <span className="material-symbols-outlined text-5xl text-[hsl(181_100%_9%/0.15)] block mb-3">
              theaters
            </span>
            <p className="font-bold text-[hsl(181_100%_9%/0.4)]">No cinemas found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[hsl(181_100%_9%/0.06)] mt-6">
            {cinemas.map((cinema) => (
              <CinemaRow key={cinema.name} cinema={cinema} cityName={cityName} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
