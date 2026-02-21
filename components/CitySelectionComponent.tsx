"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const cities = [
  { name: "Bhubaneswar", icon: "temple_hindu" },
  { name: "Mumbai",       icon: "apartment" },
  { name: "Bengaluru",    icon: "developer_board" },
  { name: "Hyderabad",    icon: "fort" },
  { name: "Pune",         icon: "school" },
  { name: "Gurgaon",      icon: "corporate_fare" },
  { name: "Surat",        icon: "diamond" },
  { name: "Goa",          icon: "beach_access" },
  { name: "Cuttack",      icon: "castle" },
  { name: "Sambalpur",    icon: "water" },
];

interface CityPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CityPickerModal({ isOpen, onClose }: CityPickerModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Lock scroll & focus search when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Only auto-focus on desktop — on mobile this would pop the keyboard
      if (window.innerWidth >= 768) {
        setTimeout(() => searchRef.current?.focus(), 80);
      }
    } else {
      document.body.style.overflow = "";
      setSearch("");
      setSelected(null);
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filtered = cities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (name: string) => {
    setSelected(name);
    // Save to localStorage
    localStorage.setItem("preferredCity", name);
    // Notify other components
    window.dispatchEvent(new Event("cityChanged"));
    // On mobile just close — CinemaList on the home page updates reactively.
    // On desktop, navigate to the cinema listing page.
    const isMobile = window.innerWidth < 768;
    setTimeout(() => {
      onClose();
      if (!isMobile) {
        router.push(`/select-cinema?city=${encodeURIComponent(name)}`);
      }
    }, 220);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Select your city"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-xl bg-[hsl(180_88%_93%)] rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/40 z-10 flex flex-col max-h-[92dvh] sm:max-h-[80vh] overflow-hidden font-[Be_Vietnam_Pro,sans-serif]">

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[hsl(181_100%_9%/0.15)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 sm:pt-5 sm:px-6 shrink-0">
          <div>
            <h2 className="text-xl font-black text-[hsl(181_100%_9%)] tracking-tight leading-none">
              Where are you watching?
            </h2>
            <p className="text-xs text-[hsl(181_100%_9%/0.45)] mt-0.5 font-medium">
              Select a city to see available cinemas
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-[hsl(181_100%_9%/0.08)] hover:bg-[hsl(181_100%_9%/0.15)] text-[hsl(181_100%_9%)] active:scale-90 transition-all"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 sm:px-6 pb-3 shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[hsl(181_100%_9%/0.35)]">
              <span className="material-symbols-outlined text-lg">search</span>
            </div>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city..."
              className="w-full h-11 pl-10 pr-4 bg-white border-2 border-[hsl(181_100%_9%/0.06)] focus:border-[hsl(181_100%_9%)] rounded-xl text-sm outline-none transition-all placeholder:text-[hsl(181_100%_9%/0.3)] text-[hsl(181_100%_9%)] font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[hsl(181_100%_9%/0.4)] hover:text-[hsl(181_100%_9%)]"
              >
                <span className="material-symbols-outlined text-base">cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 sm:mx-6 h-px bg-[hsl(181_54%_37%/0.1)] shrink-0" />

        {/* Cities grid — scrollable */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[hsl(181_100%_9%/0.35)]">
              <span className="material-symbols-outlined text-4xl mb-2">location_off</span>
              <p className="text-sm font-medium">No cities found for &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filtered.map((city) => {
                const isSelected = selected === city.name;
                return (
                  <button
                    key={city.name}
                    onClick={() => handleSelect(city.name)}
                    className={`group flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? "border-[hsl(181_100%_9%)] bg-[hsl(181_100%_9%)] text-white shadow-lg shadow-[hsl(181_100%_9%/0.25)]"
                        : "bg-white border-transparent hover:border-[hsl(181_100%_9%/0.2)] hover:shadow-md"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-white/15 text-white"
                          : "bg-[hsl(181_100%_9%/0.05)] text-[hsl(181_100%_9%)] group-hover:bg-[hsl(181_100%_9%/0.1)]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl">{city.icon}</span>
                    </div>
                    <span className={`text-xs font-bold leading-tight text-center ${isSelected ? "text-white" : "text-[hsl(181_100%_9%)]"}`}>
                      {city.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-5 sm:px-6 py-3 border-t border-[hsl(181_54%_37%/0.1)] shrink-0">
          <p className="text-[10px] text-center text-[hsl(181_100%_9%/0.3)] font-medium">
            Tap a city to see available cinemas near you
          </p>
        </div>
      </div>
    </div>
  );
}
