// components/ClientWrapper.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/hooks/theme-provider/theme-provider";
import { Toaster } from "sonner";
import { ReactNode } from "react";
import { useSessionManager } from "@/hooks/useSessionManager";

// Session management component that runs inside SessionProvider
function SessionManager({ children }: { children: ReactNode }) {
  const { status, hasRefreshError, isRefreshing } = useSessionManager();

  // Show loading state during session refresh
  if (isRefreshing) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-gray-700">Refreshing session...</span>
        </div>
      </div>
    );
  }

  // Show error state if session refresh failed
  if (hasRefreshError) {
    return (
      <div className="fixed inset-0 bg-red-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
          <div className="text-red-600 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Session Expired</h3>
          <p className="text-gray-600 mb-4">Your session has expired. You will be redirected to sign in.</p>
          <div className="animate-pulse text-sm text-gray-500">Redirecting...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      // ✅ FIX: Disable automatic refetch on window focus
      refetchInterval={0}
      refetchOnWindowFocus={false}
      // Only refetch when session is actually about to expire
      refetchWhenOffline={false}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SessionManager>
          <Toaster richColors position="bottom-right" />
          {children}
        </SessionManager>
      </ThemeProvider>
    </SessionProvider>
  );
}