"use client";
import Footer from "@/components/footer/footer";
import Faq from "@/components/landing-page/list-your-property-landing/faq";
import Hero from "@/components/landing-page/list-your-property-landing/hero";
import Hero1 from "@/components/landing-page/list-your-property-landing/hero1";
import Navbar from "@/components/navbar/navbar";

export default function ListYourPropertyLanding() {
  return (
    <div>
      <Navbar/>
      <Hero />
      <Hero1 />
      <Faq/>
      <Footer/>
    </div>
  );
}
