import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "MURID",
      },
      plan: {
        type: "string",
        defaultValue: "FREE",
      },
      currentStreak: {
        type: "number",
        defaultValue: 0,
      },
      maxStreak: {
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
  trustedOrigins: ["http://localhost:3000"],
});

export type Session = typeof auth.$Infer.Session;