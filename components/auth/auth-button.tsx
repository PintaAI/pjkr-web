"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "../../lib/auth-client";
import { useSession } from "@/hooks/use-session";
import { DEFAULT_LOGOUT_REDIRECT, DEFAULT_AUTH_REDIRECT } from "../../lib/routes";
import { Button } from "../ui/button";

interface AuthButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function AuthButton({
  variant = "default",
  size = "default",
  className
}: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const router = useRouter();

  // Ensure component only renders on client side after mount
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      // Manually redirect after successful sign out
      router.push(DEFAULT_LOGOUT_REDIRECT);
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push(DEFAULT_AUTH_REDIRECT);
  };

  // During SSR and initial hydration, show a neutral state
  if (!isClient || sessionLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
      >
        ...
      </Button>
    );
  }

  // Show sign out button when authenticated
  if (isAuthenticated) {
    return (
      <Button
        onClick={handleSignOut}
        disabled={isLoading}
        variant={variant}
        size={size}
        className={className}
      >
        {isLoading ? "Signing out..." : "Sign Out"}
      </Button>
    );
  }

  // Show sign in button when not authenticated
  return (
    <Button
      onClick={handleSignIn}
      variant={variant}
      size={size}
      className={className}
    >
      Login / Register
    </Button>
  );
}
