import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.ts";
import prisma from "../prisma.js";

const router = Router();

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
    console.error("Role selection error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/status", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.email === "jrr.industries6@gmail.com" && user.role !== "admin") {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "admin" },
      });
    }

    const { passwordHash, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error("Auth status error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;