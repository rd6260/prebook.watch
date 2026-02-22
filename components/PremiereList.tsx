"use client";

type Premiere = {
  type: "Industry" | "Public";
  label: string;
  date: string;
  time: string;
};

const PREMIERES: Premiere[] = [
  {
    type: "Industry",
    label: "Industry Premiere",
    date: "Wednesday, April 8",
    time: "7:30 pm onwards",
  },
  {
    type: "Public",
    label: "Public Premiere",
    date: "April 9",
    time: "7:00 pm onwards",
  },
];

interface PremiereCardProps {
  premiere: Premiere;
  cityName: string;
  onBook: () => void;
}

function PremiereCard({ premiere, cityName, onBook }: PremiereCardProps) {
  const isIndustry = premiere.type === "Industry";

  return (
    <div className="bg-white rounded-2xl border border-[hsl(181_100%_9%/0.08)] shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-5">

        {/* Header row: label pill + type indicator */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.4)]">
            {premiere.label}
          </span>
          <span className="w-2 h-2 rounded-full bg-[hsl(181_100%_9%/0.15)]" />
        </div>

        {/* Title */}
        <h3 className="font-black text-[hsl(181_100%_9%)] text-lg leading-tight mb-0.5">
          Bindusagar
        </h3>
        <p className="text-sm font-semibold text-[hsl(181_100%_9%/0.5)] mb-4">
          {cityName}
        </p>

        {/* Divider */}
        <div className="h-px bg-[hsl(181_100%_9%/0.07)] mb-4" />

        {/* Date + time */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[hsl(181_100%_9%/0.35)] mb-1">Date</p>
            <p className="text-sm font-bold text-[hsl(181_100%_9%)]">{premiere.date}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-wider text-[hsl(181_100%_9%/0.35)] mb-1">Time</p>
            <p className="text-sm font-bold text-[hsl(181_100%_9%)]">{premiere.time}</p>
          </div>
        </div>

        {/* Availability */}
        <p className="text-xs text-[hsl(181_100%_9%/0.45)] mb-5 leading-relaxed">
          Limited tickets available · first come first serve
        </p>

        {/* Book Now */}
        <button
          onClick={onBook}
          className="w-full py-3 rounded-xl font-bold text-sm bg-[hsl(181_100%_9%)] text-white hover:bg-[hsl(181_100%_12%)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-[hsl(181_100%_9%/0.15)]"
        >
          <span className="material-symbols-outlined text-base">confirmation_number</span>
          Book Now
        </button>
      </div>
    </div>
  );
}

interface PremiereListProps {
  cityName: string;
  onBook?: (premiere: Premiere) => void;
}

export default function PremiereList({ cityName, onBook }: PremiereListProps) {
  return (
    <div className="mt-5">

      {/* Section heading */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.4)]">
            Screenings in
          </p>
          <h2 className="text-xl font-black text-[hsl(181_100%_9%)] leading-tight">
            {cityName}
          </h2>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {PREMIERES.map((p) => (
          <PremiereCard
            key={p.type}
            premiere={p}
            cityName={cityName}
            onBook={() => onBook?.(p)}
          />
        ))}
      </div>

      {/* Venue note */}
      <div className="mt-4 flex gap-3 bg-[hsl(181_100%_9%/0.04)] border border-[hsl(181_100%_9%/0.08)] rounded-xl px-4 py-3.5">
        <span className="material-symbols-outlined text-[hsl(181_100%_9%/0.4)] text-base flex-shrink-0 mt-0.5">
          info
        </span>
        <p className="text-xs text-[hsl(181_100%_9%/0.6)] leading-relaxed">
          <span className="font-bold text-[hsl(181_100%_9%)]">Note:</span> Venue and other details
          will be sent to your registered mobile number two days before the premiere.
        </p>
      </div>
    </div>
  );
}
