"use client"
import React, { useState } from "react";
import { Mail, Phone, User, LogOut, ChevronRight, BadgeCheck, FileText, Plane, Gift } from "lucide-react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import Sidebar from "../../components/client-dashboard/Sidebar";
import MainContent from "../../components/client-dashboard/MainContent";

export default function Account() {
  const [selected, setSelected] = useState("profile");
  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row min-h-screen bg-muted/50 p-2 md:p-6 gap-4 md:gap-8 mt-20">
        <Sidebar selected={selected} setSelected={setSelected} />
        <MainContent selected={selected} />
      </div>
      <Footer />
    </>
  );
}
