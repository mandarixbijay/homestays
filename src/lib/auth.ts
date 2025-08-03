import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

console.log("[NextAuth] Initializing authOptions");

const API_BASE_URL = process.env.API_BASE_URL || "http://13.61.8.56";

// Type declarations
declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
    permissions?: string[];
    isEmailVerified?: boolean;
    isMobileVerified?: boolean;
    accessToken?: string | null;
    refreshToken?: string | null; // Added refresh token
    tokenExpiry?: number; // Added token expiry timestamp
    name?: string | null;
    email?: string | null;
    mobileNumber?: string | null;
    image?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role?: string;
      permissions?: string[];
      isEmailVerified?: boolean;
      isMobileVerified?: boolean;
      accessToken?: string | null;
      refreshToken?: string | null;
      tokenExpiry?: number;
      name?: string | null;
      email?: string | null;
      mobileNumber?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    permissions?: string[];
    isEmailVerified?: boolean;
    isMobileVerified?: boolean;
    accessToken?: string | null;
    refreshToken?: string | null;
    tokenExpiry?: number;
    name?: string | null;
    email?: string | null;
    mobileNumber?: string | null;
    image?: string | null;
  }
}

// Helper function to refresh token
async function refreshAccessToken(token: any) {
  try {
    console.log("[NextAuth] Attempting to refresh token");
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    console.log("[NextAuth] Token refreshed successfully");
    
    return {
      ...token,
      accessToken: refreshedTokens.data.accessToken,
      refreshToken: refreshedTokens.data.refreshToken ?? token.refreshToken,
      tokenExpiry: Date.now() + (5 * 24 * 60 * 60 * 1000), // 5 days from now
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
      async authorize(
        credentials: Record<"name" | "email" | "mobileNumber" | "password" | "action", string> | undefined,
        req: any
      ) {
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

            console.log("[NextAuth] Registering user:", { name, email, mobileNumber });
            const response = await fetch(`${API_BASE_URL}/auth/register-guest`, {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name, email, mobileNumber, password }),
            });

            const result = await response.json();
            console.log("[NextAuth] Register response:", result);

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

          console.log("[NextAuth] Logging in user:", { email, mobileNumber });
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, mobileNumber, password }),
          });

          const result = await response.json();
          console.log("[NextAuth] Login response:", result);

          if (!response.ok) {
            throw new Error(result.message || "Invalid credentials");
          }

          // Calculate token expiry (5 days from now)
          const tokenExpiry = Date.now() + (5 * 24 * 60 * 60 * 1000);

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
            refreshToken: result.data.refreshToken || null, // If your backend provides refresh token
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
    async signIn({ user, account, profile }) {
      console.log("[NextAuth] SignIn callback:", { user, account, profile });
      return true; // Allow sign in
    },
    async redirect({ url, baseUrl }) {
      console.log("[NextAuth] Redirect callback:", { url, baseUrl });
      
      // Handle role-based redirects
      if (url.startsWith(baseUrl)) {
        return url;
      }
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      
      return baseUrl;
    },
    async jwt({ token, user }) {
      console.log("[NextAuth] JWT callback:", { token, user });
      
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.mobileNumber = user.mobileNumber;
        token.role = user.role;
        token.permissions = user.permissions;
        token.isEmailVerified = user.isEmailVerified;
        token.isMobileVerified = user.isMobileVerified;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.tokenExpiry = user.tokenExpiry;
        token.image = user.image;
        return token;
      }

      // Return previous token if the access token has not expired yet
      if (token.tokenExpiry && Date.now() < token.tokenExpiry) {
        console.log("[NextAuth] Token still valid, returning existing token");
        return token;
      }

      // Access token has expired, try to update it using refresh token
      if (token.refreshToken) {
        console.log("[NextAuth] Token expired, attempting refresh");
        return refreshAccessToken(token);
      }

      // If no refresh token or refresh failed, but we want to keep the session alive
      // Update the expiry to 5 days from now (essentially making it not expire)
      console.log("[NextAuth] Extending token validity for 5 more days");
      return {
        ...token,
        tokenExpiry: Date.now() + (5 * 24 * 60 * 60 * 1000), // Extend for 5 more days
      };
    },
    async session({ session, token }) {
      console.log("[NextAuth] Session callback:", { session, token });
      
      // Handle token refresh error
      if (token.error === "RefreshAccessTokenError") {
        console.log("[NextAuth] Token refresh failed, but keeping session active");
        // You can choose to either end the session or keep it active
        // For now, we'll keep it active but mark the error
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
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          tokenExpiry: token.tokenExpiry,
          image: token.image,
        };
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 5 * 24 * 60 * 60, // 5 days in seconds
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  jwt: {
    maxAge: 5 * 24 * 60 * 60, // 5 days in seconds
  },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

if (!process.env.NEXTAUTH_SECRET) {
  throwError();
}

function throwError() {
  throw new Error("NEXTAUTH_SECRET is not set in environment variables");
}

console.log("[NextAuth] authOptions initialized successfully");