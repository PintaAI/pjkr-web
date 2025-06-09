import { createAuthClient } from "better-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "./routes";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
} = authClient;

// Social login functions
export const signInWithGoogle = async () => {
  const data = await signIn.social({
    provider: "google",
    callbackURL: DEFAULT_LOGIN_REDIRECT,
  });
  return data;
};

export const signInWithEmailPassword = async (email: string, password: string) => {
  const data = await signIn.email({
    email,
    password,
    callbackURL: DEFAULT_LOGIN_REDIRECT,
  });
  return data;
};

export const signUpWithEmailPassword = async (email: string, password: string, name: string) => {
  const data = await signUp.email({
    email,
    password,
    name,
    callbackURL: DEFAULT_LOGIN_REDIRECT,
  });
  return data;
};

