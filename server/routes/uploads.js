import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authenticate } from "../middleware/auth.js";
import prisma from "../prisma.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${path.extname(file.originalname)}`),
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

router.post("/profile-picture", authenticate, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const url = `/uploads/${req.file.filename}`;
    await prisma.user.update({
      where: { id: req.user.id },
      data: { image: url },
    });
    res.json({ url });
  } catch (error) {
    console.error("Profile picture upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/profile-banner", authenticate, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const url = `/uploads/${req.file.filename}`;
    await prisma.user.update({
      where: { id: req.user.id },
      data: { companyBanner: url },
    });
    res.json({ url });
  } catch (error) {
    console.error("Profile banner upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/listing-images", authenticate, upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: "No files uploaded" });
    const urls = req.files.map((f) => `/uploads/${f.filename}`);
    res.json({ urls });
  } catch (error) {
    console.error("Listing images upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
