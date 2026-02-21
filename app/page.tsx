'use client';

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import TrailerDrops from "@/components/TrailerDrops";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CityPickerModal from "@/components/CitySelectionComponent";
import CinemaList from "@/components/CinemaList";
import { cities } from "./select-cinema/page";

export default function Home() {
  const router = useRouter();
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [preferredCity, setPreferredCity] = useState<string | null>(null);
  const cinemaListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("preferredCity");
    if (stored) setPreferredCity(stored);

    const handleChange = () => {
      const updated = localStorage.getItem("preferredCity");
      setPreferredCity(updated ?? null);
    };
    window.addEventListener("cityChanged", handleChange);
    return () => window.removeEventListener("cityChanged", handleChange);
  }, []);

  // Desktop Book Now → go to /select-cinema (or open city picker if no city saved)
  const handleBookNow = () => {
    const stored = localStorage.getItem("preferredCity");
    if (stored) {
      router.push(`/select-cinema?city=${encodeURIComponent(stored)}`);
    } else {
      setCityPickerOpen(true);
    }
  };

  // Mobile Book Now → smooth scroll to CinemaList centered in viewport
  const handleScrollToCinemaList = () => {
    cinemaListRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="min-h-screen bg-background-light text-text-main font-display">
      <CityPickerModal isOpen={cityPickerOpen} onClose={() => setCityPickerOpen(false)} />
      <Navbar />

      {/* Welcome announcement bar */}
      <div className="w-full bg-[hsl(181_100%_6%)] border-b border-teal-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-2.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          <p className="text-sm text-slate-300 tracking-wide text-center">
            Welcome to{" "}
            <span className="font-bold text-white">Bindusagar</span>{" "}
            <span className="text-teal-400 font-semibold">Public Premieres</span>
          </p>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Hero
          onBookNow={handleBookNow}
          onScrollToCinemaList={handleScrollToCinemaList}
        />

        {/* Ref wrapper so scroll-into-view lands on the list */}
        <div ref={cinemaListRef}>
          <CinemaList
            cinemas={preferredCity ? (cities[preferredCity] ?? []) : []}
            cityName={preferredCity ?? ""}
          />
        </div>

        <TrailerDrops />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
