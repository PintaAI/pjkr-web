"use client";

import { useSession as useBetterAuthSession } from "../auth-client";
import { useMemo } from "react";

type UserRole = "MURID" | "GURU" | "ADMIN";
type UserPlan = "FREE" | "PREMIUM" | "CUSTOM";

interface ExtendedUser {
  role: UserRole;
  plan: UserPlan;
  currentStreak: number;
  maxStreak: number;
  xp: number;
  level: number;
  email: string;
  name?: string;
  [key: string]: unknown;
}

/**
 * Enhanced client-side session hook with additional utilities
 */
export function useSession() {
  const { data: session, isPending, error } = useBetterAuthSession();

  const user = useMemo(() => {
    if (!session?.user) return null;
    
    const rawUser = session.user as Record<string, unknown>;
    return {
      ...session.user,
      role: (rawUser.role as UserRole) || "MURID",
      plan: (rawUser.plan as UserPlan) || "FREE",
      currentStreak: (rawUser.currentStreak as number) || 0,
      maxStreak: (rawUser.maxStreak as number) || 0,
      xp: (rawUser.xp as number) || 0,
      level: (rawUser.level as number) || 1,
    } as ExtendedUser;
  }, [session]);

  const isAuthenticated = !!session;
  const isLoading = isPending;

  return {
    session,
    user,
    isAuthenticated,
    isLoading,
    error,
  };
}

/**
 * Hook to check if user has specific role
 */
export function useRole(requiredRole: string) {
  const { user, isLoading } = useSession();
  
  return {
    hasRole: user?.role === requiredRole,
    isLoading,
    userRole: user?.role,
  };
}

/**
 * Hook to check if user has specific plan
 */
export function usePlan(requiredPlan: string) {
  const { user, isLoading } = useSession();
  
  return {
    hasPlan: user?.plan === requiredPlan,
    isLoading,
    userPlan: user?.plan,
  };
}

/**
 * Hook to require authentication (throws error if not authenticated)
 */
export function useRequireAuth() {
  const { session, isLoading, error } = useSession();
  
  if (!isLoading && !session) {
    throw new Error("Authentication required");
  }
  
  return { session, isLoading, error };
}

/**
 * Hook for user permissions and role-based access
 */
export function usePermissions() {
  const { user, isLoading } = useSession();
  
  const permissions = useMemo(() => {
    if (!user) return {
      canCreateCourse: false,
      canManageUsers: false,
      canAccessPremium: false,
      isGuru: false,
      isAdmin: false,
      isMurid: false,
    };

    const role = user.role;
    const plan = user.plan;

    return {
      canCreateCourse: role === "GURU" || role === "ADMIN",
      canManageUsers: role === "ADMIN",
      canAccessPremium: plan === "PREMIUM" || plan === "CUSTOM" || role === "ADMIN",
      isGuru: role === "GURU",
      isAdmin: role === "ADMIN", 
      isMurid: role === "MURID",
    };
  }, [user]);

  return {
    ...permissions,
    isLoading,
    user,
  };
}

/**
 * Get permissions from session data without hook
 */
export function getPermissions(user: ExtendedUser | null) {
  if (!user) return {
    canCreateCourse: false,
    canManageUsers: false,
    canAccessPremium: false,
    isGuru: false,
    isAdmin: false,
    isMurid: false,
  };

  const role = user.role;
  const plan = user.plan;

  return {
    canCreateCourse: role === "GURU" || role === "ADMIN",
    canManageUsers: role === "ADMIN",
    canAccessPremium: plan === "PREMIUM" || plan === "CUSTOM" || role === "ADMIN",
    isGuru: role === "GURU",
    isAdmin: role === "ADMIN", 
    isMurid: role === "MURID",
  };
}
