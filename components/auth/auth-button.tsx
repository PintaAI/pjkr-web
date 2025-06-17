"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "../../lib/auth-client";
import { useSession } from "../../lib/hooks/use-session";
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
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const router = useRouter();

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

  // Show loading state while session is being checked
  if (sessionLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
      >
        Loading...
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