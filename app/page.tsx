'use client';

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Spotlight from "@/components/Spotlight";
import PremiereList from "@/components/PremiereList";
import { useState, useEffect, useRef } from "react";
import CastList from "@/components/CastList";
import Footer from "@/components/Footer";
import CityPickerModal from "@/components/CitySelectionComponent";

export default function Home() {
  const premiereRef = useRef<HTMLDivElement>(null);
  const [cityModalOpen, setCityModalOpen] = useState(false);

  const [preferredCity, setPreferredCity] = useState<string | null>(null);

  useEffect(() => {
    // Read on mount so server and client start with the same null, then hydrate
    const stored = localStorage.getItem("preferredCity");
    if (stored) setPreferredCity(stored);

    const handleChange = () => {
      const updated = localStorage.getItem("preferredCity");
      setPreferredCity(updated);
    };
    window.addEventListener("cityChanged", handleChange);
    return () => window.removeEventListener("cityChanged", handleChange);
  }, []);

  const scrollToPremieres = () => {
    premiereRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // "Book Now" in Hero: open city picker if no city, else scroll
  const handleBookNow = () => {
    if (!localStorage.getItem("preferredCity")) {
      setCityModalOpen(true);
    } else {
      scrollToPremieres();
    }
  };

  // Called by CityPickerModal after a city is selected
  const handleCitySelected = () => {
    const updated = localStorage.getItem("preferredCity");
    setPreferredCity(updated);
    // Scroll after modal close animation settles
    setTimeout(scrollToPremieres, 260);
  };

  return (
    <div className="min-h-screen bg-background-light text-text-main font-display">
      <Navbar onCityClick={() => setCityModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Hero
          onBookNow={handleBookNow}
          onScrollToCinemaList={handleBookNow}
        />

        {/* Premiere list — always visible */}
        <div ref={premiereRef}>
          {preferredCity && <PremiereList cityName={preferredCity} />}
        </div>

        <Spotlight />
        <CastList />
        <div className="mb-30" />
      </main>

      <Footer />

      <CityPickerModal
        isOpen={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        onCitySelected={handleCitySelected}
      />
    </div>
  );
}
