'use client';

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import TrailerDrops from "@/components/TrailerDrops";
import PremiereList from "@/components/PremiereList";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CityPickerModal from "@/components/CitySelectionComponent";

export default function Home() {
  const router = useRouter();
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [preferredCity, setPreferredCity] = useState<string | null>(null);
  const premiereRef = useRef<HTMLDivElement>(null);

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

  // After city is chosen (modal closes), scroll premiere list into view on mobile
  const handleCityPickerClose = () => {
    setCityPickerOpen(false);
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setTimeout(() => {
        premiereRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
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
  // If no city → open city picker first (scroll happens after close)
  const handleScrollToPremieres = () => {
    const stored = localStorage.getItem("preferredCity");
    if (stored) {
      premiereRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setCityPickerOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background-light text-text-main font-display">
      <CityPickerModal isOpen={cityPickerOpen} onClose={handleCityPickerClose} />
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

        {/* Premiere list — mobile only (desktop goes to /select-cinema) */}
        <div ref={premiereRef} className="md:hidden">
          {preferredCity ? (
            <PremiereList
              cityName={preferredCity}
              onBook={(premiere) => {
                // TODO: wire to booking flow
                console.log("Booking", premiere);
              }}
            />
          ) : null}
        </div>

        <TrailerDrops />
        <div className="mb-30"/>
        {/* 
        <Newsletter />
        */}
      </main>
        {/* 
      <Footer />
        */}
    </div>
  );
}
