"use client";

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

const LoginRedirect = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only run on signin page and only once
    if (pathname !== '/signin' || hasRedirected.current) {
      return;
    }

    if (status === 'authenticated' && session?.user?.role) {
      const userRole = session.user.role;
      let redirectPath = '';

      switch (userRole) {
        case 'HOST':
          redirectPath = '/host/dashboard';
          break;
        case 'ADMIN':
          redirectPath = '/admin';
          break;
        case 'COMMUNITY_MANAGER':
          redirectPath = '/community-manager-dashboard';
          break;
        case 'GUEST':
          redirectPath = '/account';
          break;
        default:
          return;
      }

      hasRedirected.current = true;
      console.log(`[LoginRedirect] Redirecting ${userRole} to ${redirectPath}`);
      router.replace(redirectPath); // Use replace to avoid back button issues
    }
  }, [session, status, router, pathname]);

  return null; // This component doesn't render anything
};

export default LoginRedirect;