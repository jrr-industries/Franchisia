import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth.ts";
import prisma from "../prisma.js";

export async function getSession(req) {
  let session = null;

  try {
    session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
  } catch (e) {
    console.error("BetterAuth getSession error:", e.message);
  }

  if (session?.user?.id) return session;

  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const parts = c.trim().split("=");
        return [parts[0], parts.slice(1).join("=")];
      })
    );
    const sessionToken = cookies["better-auth.session_token"];
    if (sessionToken) {
      const dbSession = await prisma.session.findUnique({
        where: { token: sessionToken },
        include: { user: true },
      });
      if (dbSession && dbSession.expiresAt > new Date()) {
        return { user: dbSession.user, session: dbSession };
      }
    }
  }

  return null;
}
