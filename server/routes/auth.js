import { Router } from "express";
import crypto from "crypto";
import prisma from "../prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/signup", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Email, password, and full name are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role: "franchisee",
        accountStatus: "pending_email_verification",
      },
      select: {
        id: true, email: true, fullName: true, role: true,
        accountStatus: true, createdAt: true,
      },
    });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: { userId: user.id, token, expiresAt },
    });

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        type: "email",
        token: otp,
        expiresAt: otpExpiresAt,
      },
    });

    console.log(`[DEV] Email OTP for ${email}: ${otp}`);

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (user.passwordHash !== passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: { userId: user.id, token, expiresAt },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { passwordHash: _, ...userData } = user;
    res.json({ user: userData, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      await prisma.session.deleteMany({ where: { token } });
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/send-email-otp", authenticate, async (req, res) => {
  try {
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        userId: req.user.id,
        type: "email",
        token: otp,
        expiresAt,
      },
    });

    console.log(`[DEV] Email OTP for ${req.user.email}: ${otp}`);

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/verify-email", authenticate, async (req, res) => {
  try {
    const { otp } = req.body;

    const token = await prisma.verificationToken.findFirst({
      where: {
        userId: req.user.id,
        type: "email",
        token: otp,
        expiresAt: { gt: new Date() },
      },
    });

    if (!token) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    await prisma.$transaction([
      prisma.verificationToken.delete({ where: { id: token.id } }),
      prisma.user.update({
        where: { id: req.user.id },
        data: {
          emailVerified: new Date(),
          accountStatus: "pending_phone_verification",
        },
      }),
    ]);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    const { passwordHash, ...userData } = user;

    res.json({ message: "Email verified successfully", user: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/send-phone-otp", authenticate, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { phone },
    });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        userId: req.user.id,
        type: "phone",
        token: otp,
        expiresAt,
      },
    });

    console.log(`[DEV] Phone OTP for ${phone}: ${otp}`);

    res.json({ message: "OTP sent to phone" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/verify-phone", authenticate, async (req, res) => {
  try {
    const { otp } = req.body;

    const token = await prisma.verificationToken.findFirst({
      where: {
        userId: req.user.id,
        type: "phone",
        token: otp,
        expiresAt: { gt: new Date() },
      },
    });

    if (!token) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    await prisma.$transaction([
      prisma.verificationToken.delete({ where: { id: token.id } }),
      prisma.user.update({
        where: { id: req.user.id },
        data: {
          phoneVerified: new Date(),
          accountStatus: "pending_profile_completion",
        },
      }),
    ]);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    const { passwordHash, ...userData } = user;

    res.json({ message: "Phone verified successfully", user: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/select-role", authenticate, async (req, res) => {
  try {
    const { role } = req.body;

    const validRoles = ["franchisor", "franchisee", "supplier", "consultant", "investor"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { role },
      select: {
        id: true, email: true, fullName: true, role: true,
        accountStatus: true, phoneVerified: true, emailVerified: true,
      },
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/status", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    const { passwordHash, ...userData } = user;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
