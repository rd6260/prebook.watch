"use client";

import { useState, useEffect } from "react";

export default function Hero() {
  const [trailerOpen, setTrailerOpen] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (trailerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [trailerOpen]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTrailerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <section className="relative w-full mb-12">
        <div className="relative rounded-2xl overflow-hidden bg-[hsl(181_100%_6%)]">
          <div className="flex flex-col md:flex-row md:min-h-[520px]">

            {/* Poster */}
            <div className="relative w-full md:w-[340px] md:flex-shrink-0 order-first md:order-last">
              <div className="relative w-full h-[280px] md:h-full overflow-hidden">
                <img
                  src="/movie_posters/bindusagar_poster.webp"
                  alt="Bindusagar (2025)"
                  className="w-full h-full object-cover object-top md:object-center transition-transform duration-700 hover:scale-105"
                />
                {/* Mobile bottom fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(181_100%_6%)] via-[hsl(181_100%_6%/0.3)] to-transparent md:hidden" />
                {/* Desktop left fade */}
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(181_100%_6%)] via-[hsl(181_100%_6%/0.15)] to-transparent hidden md:block" />
              </div>
            </div>

            {/* Content */}
            <div className="relative flex flex-col justify-center px-6 pb-8 pt-2 md:pt-10 md:px-12 md:pb-12 text-white flex-1 z-10">
              {/* Badge row */}
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-1 rounded bg-yellow-500 text-[hsl(181_100%_6%)] font-bold text-xs tracking-widest">
                  IMDb
                </span>
                <span className="flex items-center gap-1 text-sm font-medium">
                  <span className="material-symbols-outlined text-yellow-500 text-base">star</span>
                  8.9 Rating
                </span>
                <span className="text-xs text-slate-400 border border-slate-700 px-2 py-0.5 rounded">
                  2025
                </span>
              </div>

              {/* Title */}
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 leading-tight tracking-tight">
                Bindusagar
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-300 mb-8 font-light leading-relaxed max-w-md line-clamp-4 md:line-clamp-none">
                When a young woman's quest to discover her roots intersects with a grieving father's
                journey to faith, they find redemption and purpose in the ancient city of Bhubaneswar, India.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/select-city"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[hsl(181_100%_6%)] rounded-xl font-bold hover:bg-slate-100 transition-all shadow-xl shadow-black/30 text-sm sm:text-base"
                >
                  <span className="material-symbols-outlined text-lg">confirmation_number</span>
                  Be the first one to watch. Book Now!
                </a>

                <button
                  onClick={() => setTrailerOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 active:scale-95 transition-all text-sm sm:text-base cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">play_circle</span>
                  Watch Trailer
                </button>
              </div>
            </div>
          </div>

          {/* Teal glow */}
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-teal-900/30 blur-3xl pointer-events-none -z-0" />
        </div>
      </section>

      {/* ── TRAILER MODAL ── */}
      {trailerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Bindusagar Trailer"
        >
          {/* Backdrop — click to close */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setTrailerOpen(false)}
          />

          {/* Modal panel */}
          <div className="relative w-full max-w-3xl z-10 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 bg-[hsl(181_100%_5%)]">

            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-400 text-lg">movie</span>
                <span className="text-white font-semibold text-sm tracking-wide">
                  Bindusagar — Official Trailer
                </span>
              </div>
              <button
                onClick={() => setTrailerOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
                aria-label="Close trailer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* YouTube embed — 16:9 aspect ratio */}
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/dVZC20xQmvU?autoplay=1&rel=0&modestbranding=1"
                title="Bindusagar Official Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal footer CTA */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-white/10">
              <p className="text-slate-400 text-xs hidden sm:block">
                Press{" "}
                <kbd className="bg-white/10 text-white px-1.5 py-0.5 rounded text-xs font-mono">
                  Esc
                </kbd>{" "}
                to close
              </p>
              <a
                href="/select-city"
                onClick={() => setTrailerOpen(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[hsl(181_100%_6%)] rounded-xl font-bold hover:bg-slate-100 transition-all text-sm shadow-lg shadow-black/20 ml-auto"
              >
                <span className="material-symbols-outlined text-base">confirmation_number</span>
                Book Now
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
