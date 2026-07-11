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

export default router;