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
    name?: string | null;
    email?: string | null;
    mobileNumber?: string | null;
    image?: string | null;
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
      async authorize(credentials) {
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
      // We need to get the user's role from the URL or session
      // Since we can't access session here directly, we'll handle this in the pages
      
      // If it's a callback URL, allow it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // If it's a relative URL, make it absolute
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      
      return baseUrl;
    },
    async jwt({ token, user }) {
      console.log("[NextAuth] JWT callback:", { token, user });
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
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth] Session callback:", { session, token });
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
          image: token.image,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
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