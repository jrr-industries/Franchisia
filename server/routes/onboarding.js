import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.ts";
import prisma from "../prisma.js";

const router = Router();

router.post("/complete", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingCompleted: true },
    });

    const { passwordHash, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
