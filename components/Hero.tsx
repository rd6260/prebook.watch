"use client";

import { useState, useRef } from "react";

interface HeroProps {
  onBookNow?: () => void;
  onScrollToCinemaList?: () => void;
}

export default function Hero({ onBookNow, onScrollToCinemaList }: HeroProps) {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
    setMuted((prev) => !prev);
  };

  const handleBookNow = (e: React.MouseEvent) => {
    if (onBookNow) {
      e.preventDefault();
      onBookNow();
    }
  };

  const VideoBackground = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <video
      ref={videoRef}
      className={className}
      style={style}
      src="/videos/teaser.mp4"
      autoPlay
      muted
      loop
      playsInline
    />
  );

  return (
    <section className="relative w-full mb-12">

      {/* ─────────────────────────────────────────────
          MOBILE LAYOUT  (< md)
      ───────────────────────────────────────────── */}
      <div className="md:hidden text-white">
        <div
          className="relative overflow-hidden shadow-2xl shadow-black/60"
          style={{ aspectRatio: "3/4", borderRadius: "32px" }}
        >
          {/* Full-fill video */}
          <div className="absolute inset-0 w-full h-full bg-black">
            <VideoBackground
              className="absolute pointer-events-none w-full h-full object-cover"
            />
          </div>

          {/* Mute button */}
          <button
            onClick={toggleMute}
            className="absolute bottom-3 right-3 z-20 flex items-center justify-center w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white active:scale-90 transition-all"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
              {muted ? "volume_off" : "volume_up"}
            </span>
          </button>

          {/* Bottom overlay */}
          <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-5 pt-24 bg-gradient-to-t from-black via-black/70 to-transparent flex flex-col items-center text-center">
            <h2 className="text-3xl font-black tracking-tight leading-none mb-2 drop-shadow-lg">
              Bindusagar
            </h2>
            <div className="flex flex-wrap justify-center gap-2 mb-2.5">
              <span className="text-xs border border-white/40 text-white/90 px-3 py-0.5 rounded-full bg-white/10">
                Drama
              </span>
              <span className="text-xs border border-white/40 text-white/90 px-3 py-0.5 rounded-full bg-white/10">
                Family
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-4">
              When a young woman's quest to discover her roots intersects with a grieving father's
              journey to faith, they find redemption and purpose in the ancient city of Bhubaneswar, India.
            </p>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onScrollToCinemaList?.(); }}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-[hsl(181_100%_6%)] rounded-xl font-bold text-sm hover:bg-slate-100 transition-all shadow-lg shadow-black/30"
            >
              <span className="material-symbols-outlined text-base">confirmation_number</span>
              Be the first one to watch. Book Now!
            </a>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────
          DESKTOP LAYOUT  (>= md)
      ───────────────────────────────────────────── */}
      <div
        className="hidden md:block relative rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/60"
        style={{ minHeight: "520px" }}
      >
        {/* Full-bleed video */}
        <VideoBackground
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="absolute bottom-5 right-5 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/80 active:scale-90 transition-all"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          <span className="material-symbols-outlined text-base">
            {muted ? "volume_off" : "volume_up"}
          </span>
        </button>

        {/* Content — bottom-left */}
        <div
          className="relative z-10 flex flex-col justify-end h-full px-12 pb-12 pt-20 text-white"
          style={{ minHeight: "520px" }}
        >
          {/* IMDb + year */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-1 rounded bg-yellow-500 text-black font-bold text-[10px] tracking-widest">IMDb</span>
            <span className="flex items-center gap-1 text-sm font-medium">
              <span className="material-symbols-outlined text-yellow-500 text-base">star</span>
              8.9 Rating
            </span>
            <span className="text-xs text-slate-400 border border-slate-600 px-2 py-0.5 rounded-full">2025</span>
          </div>

          {/* Title */}
          <h2 className="text-6xl xl:text-7xl font-black tracking-tight leading-none mb-4 drop-shadow-2xl">
            Bindusagar
          </h2>

          {/* Genre pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs border border-white/30 text-slate-200 px-3 py-1 rounded-full backdrop-blur-sm bg-white/10">Spiritual Drama</span>
            <span className="text-xs border border-white/30 text-slate-200 px-3 py-1 rounded-full backdrop-blur-sm bg-white/10">Family</span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed mb-7 max-w-sm font-light">
            When a young woman's quest to discover her roots intersects with a grieving father's
            journey to faith, they find redemption and purpose in the ancient city of Bhubaneswar, India.
          </p>

          {/* CTA */}
          <a
            href="/select-city"
            onClick={handleBookNow}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[hsl(181_100%_6%)] rounded-xl font-bold hover:bg-slate-100 transition-all shadow-xl shadow-black/40 text-sm w-fit"
          >
            <span className="material-symbols-outlined text-base">confirmation_number</span>
            Be the first one to watch. Book Now!
          </a>
        </div>
      </div>

    </section>
  );
}
