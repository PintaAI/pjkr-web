"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword } from "../../lib/auth-client";
import { useSession } from "@/hooks/use-session";
import { getRedirectUrl } from "../../lib/routes";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";

export function AuthCard() {
  const { user, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = resolvedTheme === "dark" || theme === "dark" ? "/logo/hakgyo-dark.png" : "/logo/hakgyo-light.png";

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
        setError(result.error.message || "Login gagal");
      } else {
        // Refresh session to get updated user data
        router.refresh();
      }
    } catch (error) {
      setError("Login gagal. Silakan periksa kredensial Anda.");
      console.error("Login gagal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEmail || !registerPassword || !registerName) return;
    
    if (registerPassword !== confirmPassword) {
      setError("Kata sandi tidak cocok");
      return;
    }

    if (registerPassword.length < 6) {
      setError("Kata sandi harus minimal 6 karakter");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await signUpWithEmailPassword(registerEmail, registerPassword, registerName);
      if (result.error) {
        setError(result.error.message || "Pendaftaran gagal");
      } else {
        // Refresh session to get updated user data
        router.refresh();
      }
    } catch (error) {
      setError("Pendaftaran gagal. Silakan coba lagi.");
      console.error("Pendaftaran gagal:", error);
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
        setError(result.error.message || "Login Google gagal");
      } else {
        // Refresh session to get updated user data
        router.refresh();
      }
    } catch (error) {
      setError("Login Google gagal. Silakan coba lagi.");
      console.error("Login Google gagal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect based on user role after authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectUrl = getRedirectUrl(user.role);
      if (window.location.pathname === "/auth") {
        router.push(redirectUrl);
      }
    }
  }, [isAuthenticated, user, router]);

  if (!mounted || sessionLoading || isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Image
            src={logoSrc}
            alt="Hakgyo Logo"
            width={120}
            height={120}
            priority
          />
        </div>
        <CardTitle className="text-2xl">Selamat datang di Hakgyo</CardTitle>
        <CardDescription>Masuk ke akun Anda atau buat akun baru</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Masuk</TabsTrigger>
            <TabsTrigger value="register">Daftar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Masukkan email Anda"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Kata Sandi</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Masukkan kata sandi Anda"
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
                {isLoading ? "Sedang masuk..." : "Masuk"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Nama Lengkap</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
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
                  placeholder="Masukkan email Anda"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Kata Sandi</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Buat kata sandi (min 6 karakter)"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Konfirmasi Kata Sandi</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Konfirmasi kata sandi Anda"
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
                {isLoading ? "Membuat akun..." : "Buat Akun"}
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
              Atau lanjutkan dengan
            </span>
          </div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          variant="outline"
          className="w-full mt-4 gap-2"
        >
          {isLoading ? (
            "Sedang masuk..."
          ) : (
            <>
              <FcGoogle className="h-5 w-5" />
              Google
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
