import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { google, linkedin, facebook } from "better-auth/social-providers";
import prisma from "../prisma.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET || "change-me-in-production",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
  trustedOrigins: [
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:3001",
  ],
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`[DEV] Verification email to ${user.email}: ${url}`);
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPasswordEmail: async ({ user, url }) => {
      console.log(`[DEV] Reset password email to ${user.email}: ${url}`);
    },
    resetPasswordTokenExpiresIn: 3600,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    linkedin: linkedin({
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
    }),
    facebook: facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
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
