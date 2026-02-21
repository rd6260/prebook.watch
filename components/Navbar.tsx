"use client";

import { useState, useEffect } from "react";
import CityPickerModal from "@/components/CitySelectionComponent";

export default function Navbar() {
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("preferredCity");
    if (stored) setCity(stored);

    // Listen for city changes triggered by CityPickerModal
    const handleStorage = () => {
      const updated = localStorage.getItem("preferredCity");
      setCity(updated);
    };
    window.addEventListener("cityChanged", handleStorage);
    return () => window.removeEventListener("cityChanged", handleStorage);
  }, []);

  return (
    <>
      <CityPickerModal
        isOpen={cityPickerOpen}
        onClose={() => {
          setCityPickerOpen(false);
          // Re-read city in case it was updated
          const updated = localStorage.getItem("preferredCity");
          setCity(updated);
        }}
      />
      <header className="sticky top-0 z-50 w-full border-b border-[hsl(181_54%_37%/0.15)] bg-[hsl(180_88%_90%/0.85)] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Search */}
            <div className="flex items-center gap-8 flex-1">
              <div className="flex items-center gap-2 text-[hsl(181_100%_9%)] cursor-pointer select-none">
                <button
                  onClick={() => setCityPickerOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(181_100%_9%/0.06)] hover:bg-[hsl(181_100%_9%/0.12)] transition-all"
                >
                  <span className="material-symbols-outlined text-xl">location_on</span>
                  <span className="text-xs font-bold uppercase tracking-wider sm:block">
                    {city ?? "Select City"}
                  </span>
                  <span className="material-symbols-outlined text-xl">keyboard_arrow_down</span>
                </button>
              </div>
              <div className="hidden md:flex flex-1 max-w-md">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[hsl(181_100%_9%/0.5)] text-xl">search</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Search movies, actors, directors..."
                    className="block w-full pl-10 pr-3 py-2 border-none rounded-lg bg-[hsl(181_100%_9%/0.06)] focus:ring-2 focus:ring-[hsl(181_100%_9%/0.2)] text-sm placeholder-[hsl(181_100%_9%/0.4)] outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Nav & Actions */}
            <div className="flex ml-6 items-center gap-6">
              <nav className="hidden lg:flex items-center gap-8">
                {["Movies", "Cinemas", "Offers"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-sm font-semibold hover:text-[hsl(181_100%_9%)] text-[hsl(181_100%_9%/0.7)] transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </nav>
              <div className="flex items-center gap-3 border-l border-[hsl(181_54%_37%/0.15)] pl-6 ml-2">
                <div className="h-10 w-10 rounded-full bg-[hsl(181_100%_9%)] flex items-center justify-center text-white cursor-pointer overflow-hidden ring-2 ring-[hsl(181_100%_9%/0.2)]">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=aperson"
                    alt="User profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
