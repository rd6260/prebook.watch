"use client";

import { useState } from "react";

type Trailer = {
  id: string;
  title: string;
  genre: string;
  releaseLabel: string;
  poster: string;
  duration: string;
  badge?: string;
  badgeColor?: string;
  youtubeId?: string;
};

const trailers: Trailer[] = [
  {
    id: "1",
    title: "Bindusagar",
    genre: "Drama · Action",
    releaseLabel: "Now Showing",
    poster: "/movie_posters/bindusagar_poster.webp",
    duration: "2m 45s",
    badge: "New",
    badgeColor: "bg-teal-400 text-[hsl(181_100%_6%)]",
  },
  {
    id: "2",
    title: "TOXIC",
    genre: "Action · Thriller",
    releaseLabel: "Mar 2026",
    poster: "/movie_posters/toxic_poster.webp",
    duration: "3m 10s",
    badge: "Hot",
    badgeColor: "bg-red-500 text-white",
  },
  {
    id: "3",
    title: "The Sisters",
    genre: "Horror · Mystery",
    releaseLabel: "Apr 2026",
    poster: "/movie_posters/sisters_poster.webp",
    duration: "2m 20s",
  },
];

function TrailerCard({ trailer, onClick }: { trailer: Trailer; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex-shrink-0 w-36 sm:w-44 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 focus:outline-none"
      aria-label={`Play ${trailer.title} trailer`}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-[hsl(181_100%_9%/0.08)]">
        <img
          src={trailer.poster}
          alt={trailer.title}
          className="w-full h-full object-cover object-top"
          onError={(e) => {
            // Fallback gradient if poster missing
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />

        {/* Dark overlay with play button */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:bg-white/35 group-hover:scale-110 transition-all duration-200 shadow-lg">
            <span className="material-symbols-outlined text-white text-2xl" style={{ marginLeft: "2px" }}>
              play_arrow
            </span>
          </div>
        </div>

        {/* Badge */}
        {trailer.badge && (
          <div className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${trailer.badgeColor}`}>
            {trailer.badge}
          </div>
        )}

        {/* Duration */}
        <div className="absolute bottom-11 right-2.5 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px] font-bold backdrop-blur-sm">
          {trailer.duration}
        </div>

        {/* Info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 pt-6">
          <p className="text-white font-black text-xs leading-tight truncate">{trailer.title}</p>
          <p className="text-white/60 text-[10px] font-medium mt-0.5">{trailer.releaseLabel}</p>
        </div>
      </div>
    </button>
  );
}

export default function TrailerDrops() {
  const [activeTrailer, setActiveTrailer] = useState<Trailer | null>(null);

  return (
    <>
      <section className="mt-10 mb-2">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-black text-[hsl(181_100%_9%)] tracking-tight uppercase">
                Trailer Drops
              </h2>
            </div>
          </div>
          <a
            href="#"
            className="text-xs font-bold text-[hsl(181_100%_9%/0.45)] hover:text-[hsl(181_100%_9%)] transition-colors flex items-center gap-1"
          >
            All trailers
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </a>
        </div>

        {/* Horizontal scroll row */}
        <div
          className="flex gap-3 overflow-x-auto pb-3"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {trailers.map((trailer) => (
            <TrailerCard
              key={trailer.id}
              trailer={trailer}
              onClick={() => setActiveTrailer(trailer)}
            />
          ))}
        </div>
      </section>

      {/* Lightbox / video modal */}
      {activeTrailer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setActiveTrailer(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setActiveTrailer(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            {/* Video placeholder — replace src with actual embed */}
            <div className="aspect-video bg-[hsl(181_100%_6%)] flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-6xl text-white/20">movie</span>
              <p className="text-white/50 text-sm font-bold">{activeTrailer.title} — Trailer</p>
              <p className="text-white/30 text-xs">Embed your YouTube/video player here</p>
            </div>

            {/* Info bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[hsl(181_100%_6%)]">
              <div>
                <p className="text-white font-black text-sm">{activeTrailer.title}</p>
                <p className="text-white/50 text-xs">{activeTrailer.genre} · {activeTrailer.releaseLabel}</p>
              </div>
              <button className="px-4 py-2 bg-teal-400 text-[hsl(181_100%_6%)] rounded-lg font-black text-xs hover:bg-teal-300 transition-colors">
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
