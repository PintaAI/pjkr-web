"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "../lib/auth-client";
import { DEFAULT_LOGOUT_REDIRECT } from "../lib/routes";
import { Button } from "./ui/button";

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant="outline"
    >
      {isLoading ? "Signing out..." : "Sign Out"}
    </Button>
  );
}