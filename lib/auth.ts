import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
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
    process.env.BETTER_AUTH_URL || "http://localhost:3000"
  ],
  logger: {
    level: process.env.NODE_ENV === "development" ? "debug" : "error",
    disabled: false,
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
    hooks: {
      after: [
        {
          matcher(context: any) {
            return context.path === "/sign-up";
          },
          async handler(context: any) {
            if (context.returned?.user) {
              // Log user registration activity
              await logUserRegistration(
                context.returned.user.id, 
                context.returned.user.role || "MURID"
              );
            }
          },
        },
        {
          matcher(context: any) {
            return context.path === "/sign-in";
          },
          async handler(context: any) {
            if (context.returned?.user) {
              // Log user login activity
              await logUserLogin(context.returned.user.id);
            }
          },
        },
      ],
    },
  },
  plugins: [
    nextCookies() // This should be the last plugin in the array
  ],
});

export type Session = typeof auth.$Infer.Session;
