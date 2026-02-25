'use client';

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Spotlight from "@/components/Spotlight";
import PremiereList from "@/components/PremiereList";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CityPickerModal from "@/components/CitySelectionComponent";
import CastList from "@/components/CastList";

export default function Home() {
  const router = useRouter();
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [preferredCity, setPreferredCity] = useState<string | null>(null);
  const premiereRef = useRef<HTMLDivElement>(null);
  const justSelectedCity = useRef(false);

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

  // Scroll to premiere list whenever preferredCity updates AND it was triggered by city picker
  useEffect(() => {
    if (preferredCity && justSelectedCity.current) {
      justSelectedCity.current = false;
      setTimeout(() => {
        premiereRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [preferredCity]);

  // Called by CityPickerModal's onCity prop — marks that scroll should happen
  const handleCitySelected = () => {
    justSelectedCity.current = true;
  };

  // Just closes the modal — scroll is handled by the useEffect above
  const handleCityPickerClose = () => {
    setCityPickerOpen(false);
  };

  // Desktop Book Now → navigate to /select-cinema
  const handleBookNow = () => {
    const stored = localStorage.getItem("preferredCity");
    if (stored) {
      router.push(`/select-cinema?city=${encodeURIComponent(stored)}`);
    } else {
      setCityPickerOpen(true);
    }
  };

  // Mobile "Book Now" in Hero:
  // If city exists → scroll to premiere list
  // If no city → open city picker first (scroll happens after selection)
  const handleScrollToPremieres = () => {
    const stored = localStorage.getItem("preferredCity");
    if (stored) {
      premiereRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setCityPickerOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background-light text-text-main font-display">
      <CityPickerModal
        isOpen={cityPickerOpen}
        onClose={handleCityPickerClose}
      />
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
          onScrollToCinemaList={handleScrollToPremieres}
        />

        {/* Premiere list */}
        <div ref={premiereRef}>
          {preferredCity ? (
            <PremiereList
              cityName={preferredCity}
              onBook={(premiere) => {
                console.log("Booking", premiere);
              }}
            />
          ) : null}
        </div>

        <Spotlight />
        <CastList />
        <div className="mb-30" />
      </main>
    </div>
  );
}
