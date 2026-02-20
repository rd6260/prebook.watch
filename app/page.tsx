import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background-light text-text-main font-display">
      <Navbar />

      {/* Welcome announcement bar */}
      <div className="w-full bg-[hsl(181_100%_6%)] border-b border-teal-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-2.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          <p className="text-sm text-slate-300 tracking-wide text-center">
            Welcome to{" "}
            <span className="font-bold text-white">
              Bindusagar
            </span>{" "}
            <span className="text-teal-400 font-semibold">
              Public Premieres
            </span>
          </p>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Hero />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
