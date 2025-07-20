"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, signOut, signInWithEmailPassword, signUpWithEmailPassword } from "../../lib/auth-client";
import { useSession, getPermissions } from "../../lib/hooks/use-session";
import { DEFAULT_LOGIN_REDIRECT } from "../../lib/routes";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export function AuthCard() {
  const { user, isAuthenticated, isLoading: sessionLoading } = useSession();
  const { canCreateCourse, canManageUsers, canAccessPremium, isGuru, isAdmin } = getPermissions(user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithEmailPassword(loginEmail, loginPassword);
      if (result.error) {
        setError(result.error.message || "Login failed");
      } else {
        // Redirect on successful login
        router.push(DEFAULT_LOGIN_REDIRECT);
        router.refresh();
      }
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEmail || !registerPassword || !registerName) return;
    
    if (registerPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (registerPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await signUpWithEmailPassword(registerEmail, registerPassword, registerName);
      if (result.error) {
        setError(result.error.message || "Registration failed");
      } else {
        // Redirect on successful registration
        router.push(DEFAULT_LOGIN_REDIRECT);
        router.refresh();
      }
    } catch (error) {
      setError("Registration failed. Please try again.");
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(result.error.message || "Google sign in failed");
      } else {
        // Redirect on successful Google sign in
        router.push(DEFAULT_LOGIN_REDIRECT);
        router.refresh();
      }
    } catch (error) {
      setError("Google sign in failed. Please try again.");
      console.error("Google sign in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <div>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (isAuthenticated && user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Welcome back!</CardTitle>
          <CardDescription>You are signed in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.name || "Not provided"}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>XP:</strong> {user.xp}</p>
            <p><strong>Level:</strong> {user.level}</p>
            <p><strong>Current Streak:</strong> {user.currentStreak} days</p>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Permissions:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              {canCreateCourse && <li>Can create courses</li>}
              {canManageUsers && <li>Can manage users</li>}
              {canAccessPremium && <li>Can access premium features</li>}
              {isGuru && <li>Guru privileges</li>}
              {isAdmin && <li>Admin privileges</li>}
            </ul>
          </div>
          <Button 
            onClick={handleSignOut} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Signing out..." : "Sign Out"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>Sign in to your account or create a new one</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Full Name</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Create a password (min 6 characters)"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button 
          onClick={handleGoogleSignIn} 
          disabled={isLoading}
          variant="outline"
          className="w-full mt-4"
        >
          {isLoading ? "Signing in..." : "Continue with Google"}
        </Button>
      </CardContent>
    </Card>
  );
}
