"use client";

import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Data model
// ---------------------------------------------------------------------------

type PremiereType = "Industry" | "Public" | "Special Matinee";

type Premiere = {
  type: PremiereType;
  label: string;
  date: string;
  time: string;
  /** Icon name from Material Symbols */
  icon: string;
  description: string;
};

type CityConfig = {
  /** Exact display name used in headings */
  displayName: string;
  shows: Premiere[];
};

const CITY_CONFIGS: Record<string, CityConfig> = {
  bhubaneswar: {
    displayName: "Bhubaneswar",
    shows: [
      {
        type: "Industry",
        label: "Industry Premiere",
        date: "Friday, April 11",
        time: "7:30 pm onwards",
        icon: "groups",
        description:
          "Exclusive first screening with the cast, crew, and esteemed members of the film fraternity",
      },
      {
        type: "Public",
        label: "Public Premiere",
        date: "Thursday, April 9",
        time: "7:00 pm onwards",
        icon: "groups",
        description: "A special screening with the Cast & Crew in attendance.",
      },
    ],
  },

  cuttack: {
    displayName: "Cuttack",
    shows: [
      {
        type: "Special Matinee",
        label: "Special Matinee Show",
        date: "Thursday, April 9",
        time: "3:00 pm onwards",
        icon: "",
        description: "",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Add more cities here, e.g.:
  //
  // sambalpur: {
  //   displayName: "Sambalpur",
  //   shows: [ ... ],
  // },
  // -------------------------------------------------------------------------
};

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface PremiereCardProps {
  premiere: Premiere;
  cityName: string;
  onBook: () => void;
}

function PremiereCard({ premiere, cityName, onBook }: PremiereCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[hsl(181_100%_9%/0.08)] shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 pt-4 pb-5 flex flex-col flex-1">

        {/* Header row: label pill + dot */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.4)]">
            {premiere.label}
          </span>
          <span className="w-2 h-2 rounded-full bg-[hsl(181_100%_9%/0.15)]" />
        </div>

        {/* Title */}
        <h3 className="font-black text-[hsl(181_100%_9%)] text-lg leading-tight mb-0.5">
          Bindusagar — {premiere.label}
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
            {premiere.icon}
          </span>
          <p className="text-xs font-semibold text-[hsl(181_100%_9%/0.45)] leading-relaxed">
            {premiere.description}
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
              {premiere.date}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-wider text-[hsl(181_100%_9%/0.35)] mb-1">
              Time
            </p>
            <p className="text-sm font-bold text-[hsl(181_100%_9%)]">
              {premiere.time}
            </p>
          </div>
        </div>

        {/* Availability */}
        {/*
        <p className="text-xs text-[hsl(181_100%_9%/0.45)] leading-relaxed flex-1">
          Free Seating · Seats Will Be Allotted Prior to the Event
        </p>
        */}

        {/* Book Now */}
        <button
          onClick={onBook}
          className="mt-5 w-full py-3 rounded-xl font-bold text-sm bg-[hsl(181_100%_9%)] text-white hover:bg-[hsl(181_100%_12%)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-[hsl(181_100%_9%/0.15)]"
        >
          <span className="material-symbols-outlined text-base">
            confirmation_number
          </span>
          Book Now
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

  const key = cityName.trim().toLowerCase();
  const config = CITY_CONFIGS[key];

  if (!config) {
    // Graceful fallback if city isn't configured yet
    return (
      <p className="mt-5 text-sm text-[hsl(181_100%_9%/0.5)]">
        No screenings configured for <strong>{cityName}</strong> yet.
      </p>
    );
  }

  function handleBook(premiere: Premiere) {
    // Pass both type and city as URL params so the booking page
    // never has to rely solely on localStorage.
    router.push(
      `/book?type=${encodeURIComponent(premiere.type)}&city=${encodeURIComponent(config.displayName)}`
    );
  }

  const { displayName, shows } = config;
  const isOddCount = shows.length % 2 !== 0;

  return (
    <div className="mt-5 w-full max-w-7xl mx-auto sm:px-2">

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
                premiere={show}
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
