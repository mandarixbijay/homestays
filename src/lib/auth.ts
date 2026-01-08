// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Use API_BASE_URL for backend calls, NOT NEXTAUTH_URL (which is the frontend URL)
const API_BASE_URL = process.env.API_BASE_URL || "http://13.61.8.56:3001";

// Helper function to refresh token
async function refreshAccessToken(token: any) {
  try {
    console.log("[NextAuth] Attempting to refresh token");

    // Send refresh token in body for better reliability (in addition to cookies)
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        token: token.refreshToken
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[NextAuth] Refresh failed:", errorText);
      throw new Error(`Refresh failed: ${response.status}`);
    }

    const refreshedTokens = await response.json();

    if (!refreshedTokens.data?.accessToken) {
      throw new Error("Invalid refresh response");
    }

    console.log("[NextAuth] Token refreshed successfully");

    // Calculate token expiry - use backend provided value if available, otherwise default to 1 hour
    const expiresIn = refreshedTokens.data.expiresIn || 60 * 60 * 1000; // Default 1 hour
    const tokenExpiry = typeof expiresIn === 'number'
      ? Date.now() + expiresIn
      : Date.now() + (60 * 60 * 1000);

    return {
      ...token,
      accessToken: refreshedTokens.data.accessToken,
      refreshToken: refreshedTokens.data.refreshToken ?? token.refreshToken,
      tokenExpiry: tokenExpiry,
      error: null,
    };
  } catch (error) {
    console.error("[NextAuth] Error refreshing token:", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        mobileNumber: { label: "Mobile Number", type: "text" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        action: { label: "Action", type: "text" },
      },
      async authorize(credentials, req) {
        console.log("[NextAuth] Authorize called with credentials:", credentials);
        if (!credentials) {
          throw new Error("Credentials are required");
        }

        const { email, mobileNumber, password, name, action } = credentials;

        try {
          // Handle registration
          if (action === "register") {
            if (!name || (!email && !mobileNumber) || !password) {
              throw new Error("Name, either email or mobile number, and password are required");
            }

            const response = await fetch(`${API_BASE_URL}/auth/register-guest`, {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ name, email, mobileNumber, password }),
            });

            const result = await response.json();

            if (!response.ok) {
              throw new Error(result.message || "Failed to register guest");
            }

            return {
              id: result.data.id.toString(),
              name: result.data.name,
              email: result.data.email,
              mobileNumber: result.data.mobileNumber,
              role: result.data.role,
              permissions: result.data.permissions,
              isEmailVerified: result.data.isEmailVerified,
              isMobileVerified: result.data.isMobileVerified,
              accessToken: null,
              refreshToken: null,
              tokenExpiry: undefined,
              image: null,
            };
          }

          // Handle login
          if (!email && !mobileNumber) {
            throw new Error("Either email or mobile number is required");
          }
          if (!password) {
            throw new Error("Password is required");
          }

          console.log("[NextAuth] Calling login API:", `${API_BASE_URL}/auth/login`);
          
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email, mobileNumber, password }),
          });

          const result = await response.json();

          console.log("[NextAuth] Login response:", {
            ok: response.ok,
            status: response.status,
            hasData: !!result.data
          });

          if (!response.ok) {
            throw new Error(result.message || "Invalid credentials");
          }

          // Calculate token expiry - use backend provided value if available
          const expiresIn = result.data.expiresIn || 60 * 60 * 1000; // Default 1 hour
          const tokenExpiry = typeof expiresIn === 'number'
            ? Date.now() + expiresIn
            : Date.now() + (60 * 60 * 1000);

          return {
            id: result.data.user.id.toString(),
            name: result.data.user.name,
            email: result.data.user.email,
            mobileNumber: result.data.user.mobileNumber,
            role: result.data.user.role,
            permissions: result.data.user.permissions,
            isEmailVerified: result.data.user.isEmailVerified,
            isMobileVerified: result.data.user.isMobileVerified,
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
            tokenExpiry: tokenExpiry,
            image: null,
          };
        } catch (error) {
          console.error("[NextAuth] Authorize error:", error);
          throw new Error((error as Error).message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log("[NextAuth] JWT callback:", { trigger, hasUser: !!user });
      
      if (trigger === "update" && session?.accessToken) {
        token.accessToken = session.accessToken;
        token.refreshToken = session.refreshToken || token.refreshToken;
        token.tokenExpiry = Date.now() + (60 * 60 * 1000);
        token.error = null;
        return token;
      }
      
      if (
        user &&
        typeof user === "object" &&
        "mobileNumber" in user &&
        "permissions" in user &&
        "isEmailVerified" in user &&
        "isMobileVerified" in user &&
        "accessToken" in user &&
        "refreshToken" in user &&
        "tokenExpiry" in user
      ) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          mobileNumber: (user as any).mobileNumber,
          role: user.role,
          permissions: (user as any).permissions,
          isEmailVerified: (user as any).isEmailVerified,
          isMobileVerified: (user as any).isMobileVerified,
          accessToken: (user as any).accessToken,
          refreshToken: (user as any).refreshToken,
          tokenExpiry: (user as any).tokenExpiry,
          image: user.image,
          error: null,
        };
      }

      if (
        token.tokenExpiry &&
        Date.now() < Number(token.tokenExpiry) - (5 * 60 * 1000)
      ) {
        return token;
      }

      if (token.refreshToken) {
        console.log("[NextAuth] Token near expiry, attempting refresh");
        return refreshAccessToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      if (token.error === "RefreshAccessTokenError") {
        console.log("[NextAuth] Token refresh failed, ending session");
        return {
          ...session,
          error: "RefreshAccessTokenError"
        };
      }
      
      if (token) {
        session.user = {
          id: token.id ?? "",
          name: token.name ?? null,
          email: token.email ?? null,
          mobileNumber: token.mobileNumber ?? null,
          role: token.role,
          permissions: token.permissions,
          isEmailVerified: token.isEmailVerified,
          isMobileVerified: token.isMobileVerified,
          accessToken: token.accessToken as string | undefined,
          refreshToken: token.refreshToken as string | undefined,
          tokenExpiry: token.tokenExpiry,
          image: token.image as string | null | undefined,
        };
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  events: {
    async signOut(message) {
      console.log("[NextAuth] User signed out:", message);
      
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error("[NextAuth] Logout API call failed:", error);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};