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
    usePlural: true, // Use plural table names (sessions, accounts, verifications)
    schema: {
      ...schema,
      user: schema.users, // Map 'user' to our 'users' table
      session: schema.sessions, // Use our sessions table (plural)
      account: schema.accounts, // Use our accounts table (plural)
      verification: schema.verifications, // Use our verifications table (plural)
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
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  trustedOrigins: process.env.NEXT_PUBLIC_APP_URL 
    ? [process.env.NEXT_PUBLIC_APP_URL, "http://localhost:3000"]
    : ["http://localhost:3000"],
});

export type Auth = typeof auth;
