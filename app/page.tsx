'use client';

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Spotlight from "@/components/Spotlight";
import PremiereList from "@/components/PremiereList";
import { useState, useEffect, useRef } from "react";
import CastList from "@/components/CastList";
import Footer from "@/components/Footer";

const DEFAULT_CITY = "Bhubaneswar";

export default function Home() {
  const premiereRef = useRef<HTMLDivElement>(null);

  // Initialize preferredCity synchronously from localStorage,
  // falling back to DEFAULT_CITY. Also persist the default immediately.
  const [preferredCity, setPreferredCity] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("preferredCity");
      if (stored) return stored;
      localStorage.setItem("preferredCity", DEFAULT_CITY);
    }
    return DEFAULT_CITY;
  });

  useEffect(() => {
    // Ensure the default is written on first load (covers SSR/hydration gap)
    if (!localStorage.getItem("preferredCity")) {
      localStorage.setItem("preferredCity", DEFAULT_CITY);
      setPreferredCity(DEFAULT_CITY);
    }

    const handleChange = () => {
      const updated = localStorage.getItem("preferredCity") ?? DEFAULT_CITY;
      setPreferredCity(updated);
    };
    window.addEventListener("cityChanged", handleChange);
    return () => window.removeEventListener("cityChanged", handleChange);
  }, []);

  // Both desktop and mobile "Book Now" scroll to the premiere list
  const handleScrollToPremieres = () => {
    premiereRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="min-h-screen bg-background-light text-text-main font-display">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Hero
          onBookNow={handleScrollToPremieres}
          onScrollToCinemaList={handleScrollToPremieres}
        />

        {/* Premiere list — always visible */}
        <div ref={premiereRef}>
          <PremiereList cityName={preferredCity} />
        </div>

        <Spotlight />
        <CastList />
        <div className="mb-30" />
      </main>
      <Footer/>
    </div>
  );
}
