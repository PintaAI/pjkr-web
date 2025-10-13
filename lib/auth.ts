import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { createAuthMiddleware } from "better-auth/api";
import { prisma } from "./db";
import { logUserRegistration, logUserLogin } from "./activity-logger";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "MURID",
      },
      currentStreak: {
        type: "number",
        defaultValue: 0,
      },
      xp: {
        type: "number",
        defaultValue: 0,
      },
      level: {
        type: "number",
        defaultValue: 1,
      },
    }
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://hakgyo.vercel.app",
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL || ""
  ].filter(Boolean),
  logger: {
    level: process.env.NODE_ENV === "development" ? "debug" : "error",
    disabled: false,
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Handle sign-up
      if (ctx.path.startsWith("/sign-up")) {
        const newSession = ctx.context.newSession;
        if (newSession?.user) {
          try {
            await logUserRegistration(
              newSession.user.id, 
              newSession.user.role || "MURID"
            );
          } catch (error) {
            console.error("Error logging registration activity:", error);
          }
        }
      }
      
      // Handle sign-in
      if (ctx.path.startsWith("/sign-in")) {
        const newSession = ctx.context.newSession;
        if (newSession?.user) {
          try {
            await logUserLogin(newSession.user.id);
          } catch (error) {
            console.error("Error logging login activity:", error);
          }
        }
      }
    }),
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  plugins: [
    nextCookies() // This should be the last plugin in the array
  ],
});

export type Session = typeof auth.$Infer.Session;
