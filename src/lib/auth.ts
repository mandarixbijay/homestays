// /src/lib/auth.ts
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
    accessToken?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role?: string;
      permissions?: string[];
      isEmailVerified?: boolean;
      accessToken?: string | null;
      name?: string | null;
      email?: string | null;
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
    accessToken?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        action: { label: "Action", type: "text" }, // Add action to credentials
      },
      async authorize(credentials) {
        console.log("[NextAuth] Authorize called with credentials:", credentials);
        if (!credentials) {
          throw new Error("Credentials are required");
        }

        const { email, password, name, action } = credentials;

        try {
          // Handle registration
          if (action === "register") {
            if (!name || !email || !password) {
              throw new Error("Name, email, and password are required");
            }

            console.log("[NextAuth] Registering user:", { name, email });
            const response = await fetch(`${API_BASE_URL}/auth/register-guest`, {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name, email, password }),
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
              role: result.data.role,
              permissions: result.data.permissions,
              isEmailVerified: result.data.isEmailVerified,
              accessToken: null,
              image: null,
            };
          }

          // Handle login
          if (!email || !password) {
            throw new Error("Email and password are required");
          }

          console.log("[NextAuth] Logging in user:", { email });
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
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
            role: result.data.user.role,
            permissions: result.data.user.permissions,
            isEmailVerified: result.data.user.isEmailVerified,
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
    async jwt({ token, user }) {
      console.log("[NextAuth] JWT callback:", { token, user });
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.permissions = user.permissions;
        token.isEmailVerified = user.isEmailVerified;
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
          role: token.role,
          permissions: token.permissions,
          isEmailVerified: token.isEmailVerified,
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