/**
 * Auth Configuration Export
 * 
 * This file exports the Better Auth instance for use across the application.
 * This is used by the mobile API routes.
 */

import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { db } from "@/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
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
  // Required so the mobile app's `Authorization: Bearer <token>` header is
  // accepted by auth.api.getSession() on every protected mobile API route.
  // Without this, getSession() only recognizes browser session cookies and
  // mobile requests are always treated as unauthenticated (401/"session expired").
  plugins: [bearer()],
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
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
