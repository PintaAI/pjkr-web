/**
 * Routes configuration for the application
 */

// Public routes that don't require authentication
export const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/pricing",
  "/features",
] as const;

// Authentication routes (signin, signup, etc.)
export const authRoutes = [
  "/auth",
  "/auth/reset-password",
  "/auth/verify-email",
] as const;

// Protected routes that require authentication
export const protectedRoutes = [
  "/home",
  "/dashboard",
  "/profile",
  "/settings",
  "/kelas",
  "/vocabulary",
  "/soal",

] as const;

// Admin routes that require admin role (currently none - using dashboard with role checks)
export const adminRoutes = [] as const;

// Guru routes that require guru role (currently none - using dashboard with role checks)
export const guruRoutes = [] as const;

/**
 * Default redirect paths
 */
export const DEFAULT_LOGIN_REDIRECT = "/home"; // For MURID
export const DEFAULT_LOGOUT_REDIRECT = "/";
export const DEFAULT_AUTH_REDIRECT = "/auth";

/**
 * Helper functions to check route types
 */
export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname === route) || pathname.startsWith("/api/auth");
}

export function isAuthRoute(pathname: string): boolean {
  return authRoutes.some(route => pathname.startsWith(route));
}

export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

export function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(route => pathname.startsWith(route));
}

export function isGuruRoute(pathname: string): boolean {
  return guruRoutes.some(route => pathname.startsWith(route));
}

/**
 * Check if route requires specific role-based access
 * Since we don't have dedicated admin/guru routes, we handle this in components
 */
export function requiresRoleBasedAccess(pathname: string): { route: string; roles: string[] } | null {
  // Dashboard is accessible to GURU and ADMIN, but MURID gets redirected to /home
  if (pathname === "/dashboard") {
    return { route: "/dashboard", roles: ["GURU", "ADMIN"] };
  }

  return null;
}

/**
 * Get the appropriate redirect URL based on user role
 */
export function getRedirectUrl(userRole?: string): string {
  switch (userRole) {
    case "ADMIN":
      return "/dashboard";
    case "GURU":
      return "/dashboard";
    case "MURID":
    default:
      return "/home";
  }
}
