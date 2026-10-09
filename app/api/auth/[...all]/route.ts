/**
 * Better Auth API Routes Handler
 * 
 * Handles all Better Auth endpoints like /api/auth/sign-in/email, /api/auth/get-session, etc.
 */

import { auth } from "@/lib/auth/server";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
