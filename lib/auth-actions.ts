"use server";

import { getServerSession, requireAuth, hasRole, hasPlan } from "./session";
import { redirect } from "next/navigation";

/**
 * Wrapper for server actions that require authentication
 */
export async function withAuth<T extends any[], R>(
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const session = await getServerSession();
    if (!session) {
      redirect("/auth");
    }
    return action(...args);
  };
}

/**
 * Wrapper for server actions that require specific role
 */
export async function withRole<T extends any[], R>(
  requiredRole: string,
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const session = await requireAuth();
    const userRole = (session.user as any).role;
    
    if (userRole !== requiredRole) {
      throw new Error(`Access denied. Required role: ${requiredRole}`);
    }
    
    return action(...args);
  };
}

/**
 * Wrapper for server actions that require specific plan
 */
export async function withPlan<T extends any[], R>(
  requiredPlan: string,
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const session = await requireAuth();
    const userPlan = (session.user as any).plan;
    
    if (userPlan !== requiredPlan && userPlan !== "CUSTOM") {
      throw new Error(`Access denied. Required plan: ${requiredPlan}`);
    }
    
    return action(...args);
  };
}

/**
 * Example server actions demonstrating usage
 */

// Protected action that requires authentication
export const getUserProfile = withAuth(async () => {
  const session = await getServerSession();
  return {
    user: session!.user,
    message: "This is a protected action",
  };
});

// Action that requires GURU role
export const createCourse = withRole("GURU", async (title: string, description: string) => {
  const session = await getServerSession();
  
  // Your course creation logic here
  return {
    success: true,
    message: `Course "${title}" created by ${session!.user.email}`,
  };
});

// Action that requires PREMIUM plan
export const accessPremiumFeature = withPlan("PREMIUM", async () => {
  const session = await getServerSession();
  
  // Your premium feature logic here
  return {
    success: true,
    message: `Premium feature accessed by ${session!.user.email}`,
  };
});

// Admin-only action
export const manageUsers = withRole("ADMIN", async () => {
  const session = await getServerSession();
  
  // Your user management logic here
  return {
    success: true,
    message: `User management accessed by ${session!.user.email}`,
  };
});

/**
 * Utility functions for common checks in server actions
 */

export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user || null;
}

export async function assertAuthenticated() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  return session;
}

export async function assertRole(requiredRole: string) {
  const session = await assertAuthenticated();
  const userRole = (session.user as any).role;
  
  if (userRole !== requiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }
  
  return session;
}

export async function assertPlan(requiredPlan: string) {
  const session = await assertAuthenticated();
  const userPlan = (session.user as any).plan;
  
  if (userPlan !== requiredPlan && userPlan !== "CUSTOM") {
    throw new Error(`Access denied. Required plan: ${requiredPlan}`);
  }
  
  return session;
}