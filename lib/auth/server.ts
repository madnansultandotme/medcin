/**
 * Better Auth Server Instance
 * 
 * This is your own Better Auth server running locally in Next.js
 * Connected to your Neon PostgreSQL database
 * 
 * Includes Google OAuth with account linking support and doctor validation
 */

import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { findUserByEmail, validateDoctorProfile } from "./google-oauth-helper";

// Validate Google OAuth credentials at startup
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Google OAuth credentials not configured: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set');
}

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
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  // Required for Flutter/mobile apps to use Bearer token authentication
  plugins: [bearer()],
  // Enable account linking with strict email matching
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "email-password"],
      allowDifferentEmails: false, // Require same email for linking
    },
  },
  // Validate user during OAuth flow
  user: {
    validateUserInfo: async ({ user, source }) => {
      // Only validate Google OAuth sign-ins
      if (source.oauth?.providerId !== "google") {
        return;
      }

      // Check if this is a new user (no existing account with this email)
      const existingUser = await findUserByEmail(user.email || '');
      
      // If user exists, allow sign-in (Better Auth will link the account automatically)
      if (existingUser) {
        // If existing user is a doctor, verify they have a doctor profile
        if (existingUser.role === "DOCTOR") {
          const doctorProfile = await validateDoctorProfile(existingUser.id);
          if (!doctorProfile) {
            return {
              error: "invalid_doctor_profile",
              errorDescription: "Doctor profile not found. Please contact your center administrator.",
            };
          }
        }
        // Allow linking for existing users
        return;
      }

      // New user trying to sign up with Google
      // We'll allow patients and centers to sign up with Google
      // Doctors must be provisioned by center admin first
      // Note: Better Auth doesn't know the role yet for new users, so we can't block here
      // Instead, we'll check in the database hooks if needed
    },
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
