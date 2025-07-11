// src/app/page.tsx
import dynamic from "next/dynamic";
import Footer from "@/components/footer/footer";
import Hero from "@/components/landing-page/hero";
import Hero1 from "@/components/landing-page/hero1";
import Hero2 from "@/components/landing-page/hero2";
import Hero3 from "@/components/landing-page/hero3";
import Navbar from "@/components/navbar/navbar";
import Hero4Wrapper from "@/components/Hero4Wrapper"; // Import the wrapper

export default function Home() {
  console.log("Rendering root page"); // Debug log
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="transition-all duration-300">
        <Hero />
        <Hero1 />
        <Hero2 />
        <Hero3 />
        <Hero4Wrapper /> {/* Use Hero4Wrapper instead of Hero4 */}
      </main>
      <Footer />
    </div>
  );
}