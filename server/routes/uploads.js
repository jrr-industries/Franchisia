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

const ALLOWED_MIMES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"],
};

function fileFilter(allowed) {
  return (_req, file, cb) => {
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${allowed.join(", ")}`));
  };
}

const uploadImage = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: fileFilter(ALLOWED_MIMES.image) });
const uploadDocument = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: fileFilter(ALLOWED_MIMES.document) });
const uploadImages = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: fileFilter(ALLOWED_MIMES.image) });

const router = Router();

router.post("/profile-picture", authenticate, (req, res) => {
  uploadImage.single("image")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "File too large. Maximum 5MB." });
      return res.status(400).json({ error: err.message });
    }
    if (err) return res.status(400).json({ error: err.message });
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
});

router.post("/profile-banner", authenticate, (req, res) => {
  uploadImage.single("image")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "File too large. Maximum 5MB." });
      return res.status(400).json({ error: err.message });
    }
    if (err) return res.status(400).json({ error: err.message });
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
});

router.post("/listing-images", authenticate, (req, res) => {
  uploadImages.array("images", 10)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "File too large. Maximum 5MB per image." });
      if (err.code === "LIMIT_UNEXPECTED_FILE") return res.status(400).json({ error: "Too many files. Maximum 10." });
      return res.status(400).json({ error: err.message });
    }
    if (err) return res.status(400).json({ error: err.message });
    try {
      if (!req.files || req.files.length === 0) return res.status(400).json({ error: "No files uploaded" });
      const urls = req.files.map((f) => `/uploads/${f.filename}`);
      res.json({ urls });
    } catch (error) {
      console.error("Listing images upload error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

router.post("/application-document", authenticate, (req, res) => {
  uploadDocument.single("file")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "File too large. Maximum 10MB." });
      return res.status(400).json({ error: err.message });
    }
    if (err) return res.status(400).json({ error: err.message });
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const url = `/uploads/${req.file.filename}`;
      res.json({ url, fileName: req.file.originalname, size: req.file.size });
    } catch (error) {
      console.error("Application document upload error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

export default router;