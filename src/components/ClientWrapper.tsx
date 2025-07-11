"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/hooks/theme-provider/theme-provider";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { ReactNode } from "react";

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster richColors position="bottom-right" />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
