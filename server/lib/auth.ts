import dotenv from "dotenv";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../prisma.js";

dotenv.config();

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
  trustedOrigins: [
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3001",
  ],
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`[DEV] Verification email sent to ${user.email}`);
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPasswordEmail: async ({ user, url }) => {
      console.log(`[DEV] Reset password email sent to ${user.email}`);
    },
    resetPasswordTokenExpiresIn: 3600,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    },
  },
  user: {
    additionalFields: {
      onboardingCompleted: {
        type: "boolean",
        defaultValue: false,
        required: false,
        input: false,
      },
      role: {
        type: "string",
        defaultValue: "none",
        required: false,
        input: false,
      },
    },
  },
});
