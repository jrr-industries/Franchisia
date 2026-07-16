import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.ts";
import prisma from "../prisma.js";

export async function authenticate(req, res, next) {
  try {
    console.log("[AuthMiddleware] === authenticate START ===");
    console.log(`[AuthMiddleware] req.headers.cookie present: ${!!req.headers.cookie}`);
    if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').map(c => c.trim().split('=')[0]);
      console.log(`[AuthMiddleware] Cookie names: ${cookies.join(', ')}`);
    }
    console.log(`[AuthMiddleware] req.headers.authorization present: ${!!req.headers.authorization}`);

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    console.log(`[AuthMiddleware] Session result: ${session ? 'VALID' : 'NULL'}`);
    if (session?.user) {
      console.log(`[AuthMiddleware] Authenticated user: id=${session.user.id}, email=${session.user.email}`);
    }

    if (!session?.user) {
      console.log("[AuthMiddleware] FAIL: No valid session found");
      return res.status(401).json({ error: "Authentication required" });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, email: true, name: true, role: true, image: true,
        isActive: true, verified: true, emailVerified: true,
        accountStatus: true, onboardingCompleted: true, createdAt: true,
      },
    });

    if (!fullUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!fullUser.isActive) {
      return res.status(403).json({ error: "Account suspended" });
    }

    req.user = fullUser;
    console.log(`[AuthMiddleware] Full user loaded: id=${fullUser.id}, email=${fullUser.email}, emailVerified=${fullUser.emailVerified}`);
    console.log("[AuthMiddleware] === authenticate END (SUCCESS) ===");
    next();
  } catch (error) {
    console.error("[AuthMiddleware] UNCAUGHT EXCEPTION:", error);
    console.error("[AuthMiddleware] Stack:", error.stack);
    res.status(500).json({ error: "Authentication failed" });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

export const requireFranchisor = authorize("franchisor");
export const requireFranchisee = authorize("franchisee");
export const requireConsultant = authorize("consultant");
export const requireInvestor = authorize("investor");
export const requireSupplier = authorize("supplier");
export const requireAdmin = authorize("admin");

export function requireOwnership(lookup) {
  return async (req, res, next) => {
    try {
      if (req.user.role === "admin") return next();
      const record = await lookup(req);
      if (!record) return res.status(404).json({ error: "Not found" });
      const ownerId = record.ownerId || record.userId;
      if (ownerId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      req.record = record;
      next();
    } catch (error) {
      console.error("requireOwnership error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
