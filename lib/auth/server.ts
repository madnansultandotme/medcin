/**
 * Better Auth Server Instance
 * 
 * This is your own Better Auth server running locally in Next.js
 * Connected to your Neon PostgreSQL database
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours (in seconds)
    updateAge: 60 * 60 * 24, // Only update session once per day (reduces DB writes)
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache session validation for 5 minutes
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "",
    process.env.NEXT_PUBLIC_APP_URL || "",
    "http://localhost:3000",
    "https://medcin.vercel.app"
  ].filter(Boolean),
});

export type Auth = typeof auth;
