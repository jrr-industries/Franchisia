import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.ts";
import prisma from "../prisma.js";
import { createAndSendOtp, verifyOtp, resendOtp } from "../services/otpService.js";
import { authenticate } from "../middleware/auth.js";
import { sendWelcomeEmail } from "../services/emailService.js";

const router = Router();

router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists. Please login." });
    }
    res.json({ available: true });
  } catch (error) {
    console.error("check-email error:", error);
    res.status(500).json({ error: "Failed to check email" });
  }
});

router.post("/select-role", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { role } = req.body;

    const validRoles = ["franchisor", "franchisee", "supplier", "consultant", "investor"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role selected" });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
    });

    const { passwordHash, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    console.error("Auth route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/status", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user?.id) {
      return res.json(null);
    }

    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) return res.json(null);

    let needsCompany = false;
    let companyStatus = null;
    if (user.role === "franchisor") {
      const company = await prisma.company.findFirst({ where: { ownerId: user.id } });
      if (!company) {
        needsCompany = true;
      } else {
        companyStatus = company.status;
      }
    }

    const { passwordHash, ...userData } = user;
    res.json({ ...userData, needsCompany, companyStatus });
  } catch (error) {
    console.error("Auth route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/send-otp", authenticate, async (req, res) => {
  try {
    console.log("=== /send-otp START ===");
    console.log(`[send-otp] req.user.id = ${req.user?.id}`);
    console.log(`[send-otp] req.user.email = ${req.user?.email}`);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      console.log("[send-otp] FAIL: User not found in DB");
      return res.status(404).json({ error: "User not found" });
    }
    console.log(`[send-otp] DB user found: id=${user.id}, email=${user.email}, emailVerified=${user.emailVerified}`);

    if (user.emailVerified) {
      console.log("[send-otp] FAIL: Email already verified");
      return res.status(400).json({ error: "Email already verified" });
    }

    console.log(`[send-otp] Calling createAndSendOtp(userId=${user.id}, email=${user.email}, name=${user.name})`);

    const result = await createAndSendOtp(user.id, user.email, user.name);

    console.log(`[send-otp] createAndSendOtp result:`, JSON.stringify(result));

    if (!result.success) {
      console.log(`[send-otp] FAIL: createAndSendOtp returned error: ${result.error}`);
      return res.status(429).json({ error: result.error });
    }

    console.log(`[send-otp] SUCCESS: OTP email sent successfully (expiresAt=${result.expiresAt})`);
    console.log("=== /send-otp END ===");

    res.json({ success: true, message: "Verification code sent to your email" });
  } catch (error) {
    console.error("[send-otp] UNCAUGHT EXCEPTION:", error);
    console.error("[send-otp] Stack:", error.stack);
    res.status(500).json({ error: "Failed to send verification code" });
  }
});

router.post("/verify-otp", authenticate, async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: "Invalid OTP format" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.emailVerified) return res.status(400).json({ error: "Email already verified" });

    const result = await verifyOtp(user.id, otp);
    if (!result.success) return res.status(400).json({ error: result.error });

    console.log(`OTP verified`);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    });

    console.log(`Email verified`);

    await sendWelcomeEmail(user);

    console.log(`Welcome email sent`);

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("verify-otp error:", error);
    res.status(500).json({ error: "Failed to verify code" });
  }
});

router.post("/resend-otp", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.emailVerified) return res.status(400).json({ error: "Email already verified" });

    const result = await resendOtp(user.id, user.email, user.name);
    if (!result.success) return res.status(429).json({ error: result.error });

    res.json({ success: true, message: "New verification code sent" });
  } catch (error) {
    console.error("resend-otp error:", error);
    res.status(500).json({ error: "Failed to resend code" });
  }
});

export default router;