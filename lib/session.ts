import { headers } from "next/headers";
import { auth } from "./auth";
import type { Session } from "./auth";

/**
 * Get session on the server-side
 * Use this in Server Components, API routes, and Server Actions
 */
export async function getServerSession(): Promise<Session | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Error getting server session:", error);
    return null;
  }
}

/**
 * Get user on the server-side
 * Use this in Server Components, API routes, and Server Actions
 */
export async function getServerUser() {
  const session = await getServerSession();
  return session?.user || null;
}

/**
 * Require authentication on the server-side
 * Throws an error if user is not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  return session;
}

/**
 * Check if user has specific role on server-side
 */
export async function hasRole(requiredRole: string) {
  const session = await getServerSession();
  if (!session) return false;
  
  const userRole = (session.user as any).role;
  return userRole === requiredRole;
}

/**
 * Check if user has specific plan on server-side
 */
export async function hasPlan(requiredPlan: string) {
  const session = await getServerSession();
  if (!session) return false;
  
  const userPlan = (session.user as any).plan;
  return userPlan === requiredPlan;
}