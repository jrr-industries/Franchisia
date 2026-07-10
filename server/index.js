import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import companyRoutes from "./routes/companies.js";
import listingRoutes from "./routes/listings.js";
import applicationRoutes from "./routes/applications.js";
import messageRoutes from "./routes/messages.js";
import notificationRoutes from "./routes/notifications.js";
import publicRoutes from "./routes/public.js";
import adminRoutes from "./routes/admin.js";
import analyticsRoutes from "./routes/analytics.js";
import onboardingRoutes from "./routes/onboarding.js";
import followRoutes from "./routes/follow.js";
import reportRoutes from "./routes/reports.js";
import discoverRoutes from "./routes/discover.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: [process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});
app.use("/api/auth", limiter);
app.use("/api/admin", limiter);

app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/auth", toNodeHandler(auth));

app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/discover", discoverRoutes);

app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
