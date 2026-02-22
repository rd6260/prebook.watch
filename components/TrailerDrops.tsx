"use client";

type Reel = {
  id: string;
  title: string;
  genre: string;
  releaseLabel: string;
  poster: string;
  duration: string;
  badge?: string;
  badgeColor?: string;
  instagramUrl: string;
};

const reels: Reel[] = [
  {
    id: "1",
    title: "Teaser Drop",
    genre: "",
    releaseLabel: "",
    poster: "/reel_thumbnails/reel-01.jpg",
    duration: "",
    badge: "",
    badgeColor: "bg-teal-400 text-[hsl(181_100%_6%)]",
    instagramUrl: "https://www.instagram.com/reel/DUkVpbFEVH6/?igsh=MjV1azA5cTFmdWpx",
  },
  {
    id: "2",
    title: "Bhola Shankar",
    genre: "",
    releaseLabel: "",
    poster: "/reel_thumbnails/reel-02.jpg",
    duration: "",
    badge: "",
    badgeColor: "bg-red-500 text-white",
    instagramUrl: "https://www.instagram.com/reel/DUumivLk-1J/?igsh=ODhlejExc2gzNXpx",
  },
  {
    id: "3",
    title: "Prakruti Mishra",
    genre: "",
    releaseLabel: "",
    poster: "/reel_thumbnails/reel-03.jpg",
    duration: "",
    instagramUrl: "https://www.instagram.com/reel/DU0-XCkgc-U/?igsh=Z3k3YnJhM3BwYnhp",
  },
];

function ReelCard({ reel }: { reel: Reel }) {
  const handleClick = () => {
    window.open(reel.instagramUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className="group relative flex-shrink-0 w-36 sm:w-44 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 focus:outline-none"
      aria-label={`Watch ${reel.title} reel on Instagram`}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-[hsl(181_100%_9%/0.08)]">
        <img
          src={reel.poster}
          alt={reel.title}
          className="w-full h-full object-cover object-top"
          onError={(e) => {
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

        {/* Instagram icon */}
        <div className="absolute top-2.5 right-2.5 opacity-70 group-hover:opacity-100 transition-opacity">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>

        {/* Badge */}
        {reel.badge && (
          <div className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${reel.badgeColor}`}>
            {reel.badge}
          </div>
        )}

        {/* Duration */}
        <div className="absolute bottom-11 right-2.5 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px] font-bold backdrop-blur-sm">
          {reel.duration}
        </div>

        {/* Info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 pt-6">
          <p className="text-white font-black text-xs leading-tight truncate">{reel.title}</p>
          <p className="text-white/60 text-[10px] font-medium mt-0.5">{reel.releaseLabel}</p>
        </div>
      </div>
    </button>
  );
}

export default function Spotlight() {
  return (
    <section className="mt-10 mb-2">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-black text-[hsl(181_100%_9%)] tracking-tight uppercase">
              Spotlight
            </h2>
          </div>
        </div>
      </div>

      {/* Horizontal scroll row */}
      <div
        className="flex gap-3 overflow-x-auto pb-3"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {reels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </div>
    </section>
  );
}
