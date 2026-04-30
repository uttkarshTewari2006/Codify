import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * NextAuth config — JWT-only (Option B).
 * JWT payload includes user_id so FastAPI can trust the token.
 */

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID ?? "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
      wellKnown: "https://www.linkedin.com/oauth/.well-known/openid-configuration",
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split("@")[0],
          onboarded: user.onboarded,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, upsert the user into the Prisma database
      if (account && account.provider !== "credentials" && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Create new user for this OAuth account
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || user.email.split("@")[0],
                password: "", // OAuth users don't need a password
                onboarded: false,
              },
            });
          }
        } catch (e) {
          console.error("[Auth] Error upserting OAuth user:", e);
          // Don't block sign-in if DB upsert fails
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      // On initial sign-in, resolve the DB user's cuid
      if (user) {
        if (account && account.provider !== "credentials" && user.email) {
          // OAuth: look up the Prisma user by email to get the cuid
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email },
            });
            if (dbUser) {
              token.user_id = dbUser.id;
              token.email = dbUser.email;
              token.onboarded = dbUser.onboarded;
              token.isAdmin = dbUser.isAdmin;
            } else {
              // Fallback if DB lookup fails
              token.user_id = user.id;
              token.email = user.email ?? undefined;
              token.onboarded = false;
              token.isAdmin = false;
            }
          } catch {
            token.user_id = user.id;
            token.email = user.email ?? undefined;
            token.onboarded = false;
            token.isAdmin = false;
          }
        } else {
          // Credentials: user.id is already the Prisma cuid
          token.user_id = user.id;
          token.email = user.email ?? undefined;
          token.onboarded = user.onboarded;
          token.isAdmin = user.isAdmin;
        }
      }

      // Handle session update trigger
      if (trigger === "update" && session?.onboarded !== undefined) {
        token.onboarded = session.onboarded;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.user_id;
        session.user.email = token.email ?? session.user.email ?? null;
        session.user.onboarded = token.onboarded;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
