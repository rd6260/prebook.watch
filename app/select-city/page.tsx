"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";

const cities = [
  { name: "Bhubaneswar", icon: "temple_hindu" },
  { name: "Mumbai", icon: "apartment" },
  { name: "Bangalore", icon: "developer_board" },
  { name: "Hyderabad", icon: "fort" },
  { name: "Pune", icon: "school" },
  { name: "Gurgaon", icon: "corporate_fare" },
  { name: "Surat", icon: "diamond" },
  { name: "Goa", icon: "beach_access" },
  { name: "Cuttack", icon: "castle" },
  { name: "Sambalpur", icon: "water" },
];

export default function SelectCityPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = cities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[hsl(180_88%_90%)] text-[hsl(185_100%_1%)] font-[Be_Vietnam_Pro,sans-serif]">
      <Navbar />

      {/* Main */}
      <main className="flex-1 flex flex-col items-center py-12 px-6 md:px-20 max-w-7xl mx-auto w-full">

        {/* Hero Text */}
        <div className="w-full max-w-3xl text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-[hsl(181_100%_9%)] mb-4 tracking-tight">
            Where are you watching?
          </h1>
          <p className="text-[hsl(181_100%_9%/0.55)] text-lg font-medium">
            Select your city to see the latest movies playing near you
          </p>
        </div>

        {/* Search + Auto-detect */}
        <div className="w-full max-w-2xl space-y-4 mb-10">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[hsl(181_100%_9%/0.4)] group-focus-within:text-[hsl(181_100%_9%)] transition-colors">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for your city..."
              className="block w-full h-14 pl-12 pr-4 bg-white border-2 border-[hsl(181_100%_9%/0.06)] focus:border-[hsl(181_100%_9%)] focus:ring-0 rounded-xl text-lg outline-none transition-all placeholder:text-[hsl(181_100%_9%/0.3)]"
            />
          </div>
          <div className="flex justify-center">
            <button className="flex items-center gap-2 px-6 py-3 bg-[hsl(181_100%_9%/0.08)] hover:bg-[hsl(181_100%_9%/0.15)] text-[hsl(181_100%_9%)] font-bold rounded-full transition-all text-sm">
              <span className="material-symbols-outlined text-xl">my_location</span>
              Auto-detect my location
            </button>
          </div>
        </div>

        {/* CTA Banner if city selected */}
        {selected && (
          <div className="w-fit mb-16 p-6 rounded-2xl bg-white border border-[hsl(181_54%_37%/0.15)] flex flex-col sm:flex-row items-center justify-between gap-8 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-[hsl(181_100%_9%)]">location_on</span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[hsl(181_100%_9%/0.4)]">Selected City</p>
                <p className="text-xl font-black text-[hsl(181_100%_9%)]">{selected}</p>
              </div>
            </div>
            <button className="px-8 py-3 bg-[hsl(181_100%_9%)] text-white font-bold rounded-xl hover:bg-[hsl(181_100%_12%)] transition-colors shadow-lg shadow-[hsl(181_100%_9%/0.2)]">
              Continue to Movies →
            </button>
          </div>
        )}

        {/* Popular Cities */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-8 border-b border-[hsl(181_54%_37%/0.1)] pb-4">
            <h2 className="text-2xl font-bold text-[hsl(181_100%_9%)] flex items-center gap-2">
              <span className="material-symbols-outlined">location_city</span>
              Popular Cities
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-[hsl(181_100%_9%/0.4)] font-medium">
              No cities found for &ldquo;{search}&rdquo;
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filtered.map((city) => (
                <button
                  key={city.name}
                  onClick={() => setSelected(city.name)}
                  className={`group flex flex-col items-center p-6 rounded-2xl border transition-all duration-300 ${selected === city.name
                    ? "border-[hsl(181_100%_9%)] bg-[hsl(181_100%_9%)] text-white shadow-xl shadow-[hsl(181_100%_9%/0.2)]"
                    : "bg-white border-[hsl(181_100%_9%/0.06)] hover:border-[hsl(181_100%_9%)] hover:shadow-xl hover:shadow-[hsl(181_100%_9%/0.1)]"
                    }`}
                >
                  <div
                    className={`w-20 h-20 mb-4 rounded-full flex items-center justify-center transition-colors ${selected === city.name
                      ? "bg-white/20 text-white"
                      : "bg-[hsl(181_100%_9%/0.05)] text-[hsl(181_100%_9%)] group-hover:bg-[hsl(181_100%_9%)] group-hover:text-white"
                      }`}
                  >
                    <span className="material-symbols-outlined text-4xl">{city.icon}</span>
                  </div>
                  <span
                    className={`font-bold ${selected === city.name ? "text-white" : "text-[hsl(181_100%_9%)]"
                      }`}
                  >
                    {city.name}
                  </span>
                  {selected === city.name && (
                    <span className="mt-2 text-xs font-black uppercase tracking-widest text-white/70">
                      Selected ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>


        {/* Can't find city banner */}
        <div className="w-full mt-20 p-8 rounded-3xl bg-[hsl(181_100%_9%)] text-white flex flex-col md:flex-row items-center gap-10 overflow-hidden relative">
          <div className="flex-1 z-10">
            <h3 className="text-3xl font-bold mb-4">Can&apos;t find your city?</h3>
            <p className="text-[hsl(180_100%_89%/0.65)] mb-8 max-w-md">
              We are constantly expanding to new locations. Check out our cinema locator to find
              the nearest theater in your region.
            </p>
            <button className="bg-white text-[hsl(181_100%_9%)] px-8 py-3 rounded-xl font-bold hover:bg-[hsl(180_100%_89%)] transition-colors">
              View All Cinemas
            </button>
          </div>
          <div className="flex-1 w-full h-64 md:h-80 rounded-2xl overflow-hidden relative grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-crosshair">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAUdjmCKY2gjrTEtBe_m1CGsA59X4IriXxepltQA4Dp3CIPhRPvBQpKDA1QNfYNtRx1rxtqmZyAnbefAuBgXYQm2_c9lxArsQab0WQG4DM8MXWBv-diTWCIAou2iFlnRzLiWDcvFtNfxuzVJYt-3LpHOe1ddAhnwXgY6tT9GBij0EJLOP2R4rnvvHK1U97Cza0IftOl-vV_vfZAPEcv7uRbBl3P7pUCtOZBnkL5AEYnyu80vBOWzaiXYJ4vIe4w6G6qFfwfkNAvUE"
              alt="Map of India"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(181_100%_9%/0.8)] to-transparent" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-10 px-6 md:px-20 border-t border-[hsl(181_54%_37%/0.08)] flex flex-col md:flex-row justify-between items-center gap-4 text-[hsl(181_100%_9%/0.35)] text-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">copyright</span>
          <span>2026 Prebook.watch Booking. All rights reserved.</span>
        </div>
        <div className="flex gap-8">
          {["Privacy Policy", "Terms of Service", "Help Center"].map((item) => (
            <a key={item} href="#" className="hover:text-[hsl(181_100%_9%)] transition-colors">
              {item}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
