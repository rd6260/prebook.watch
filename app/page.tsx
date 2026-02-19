import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import NowShowing from "@/components/NowShowing";
import ComingSoon from "@/components/ComingSoon";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background-light text-text-main font-display">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Hero />
        <NowShowing />
        <ComingSoon />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
