import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.put("/franchisor", async (req, res) => {
  try {
    const {
      companyName, businessEmail, phone, website,
      businessRegistrationNumber, location,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        companyName,
        businessEmail,
        phone,
        website,
        businessRegistrationNumber,
        location,
      },
    });

    const { passwordHash, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/franchisee", async (req, res) => {
  try {
    const {
      phone, location, investmentCapacity, preferredIndustry,
      preferredLocation, linkedinUrl, headline, bio,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        phone,
        location,
        investmentCapacity: investmentCapacity ? parseFloat(investmentCapacity) : undefined,
        preferredIndustry,
        preferredLocation,
        linkedinUrl,
        headline,
        bio,
        accountStatus: "verified",
      },
    });

    const { passwordHash, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/supplier", async (req, res) => {
  try {
    const {
      companyName, businessEmail, phone, website,
      gstNumber, businessRegistrationNumber, location,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        companyName,
        businessEmail,
        phone,
        website,
        gstNumber,
        businessRegistrationNumber,
        location,
      },
    });

    const { passwordHash, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/consultant", async (req, res) => {
  try {
    const {
      consultancyName, phone, linkedinUrl, experienceYears,
      businessRegistrationNumber, location, headline, bio,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        consultancyName,
        phone,
        linkedinUrl,
        experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
        businessRegistrationNumber,
        location,
        headline,
        bio,
      },
    });

    const { passwordHash, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/investor", async (req, res) => {
  try {
    const {
      phone, location, investmentRange, industries,
      linkedinUrl, headline, bio,
    } = req.body;

    const processedIndustries = typeof industries === "string"
      ? industries.split(",").map((s) => s.trim()).filter(Boolean)
      : (industries || []);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        phone,
        location,
        investmentRange,
        industries: processedIndustries,
        linkedinUrl,
        headline,
        bio,
        accountStatus: "verified",
      },
    });

    const { passwordHash, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/submit-for-review", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        accountStatus: "pending_admin_review",
        submittedForReviewAt: new Date(),
      },
    });

    const { passwordHash, ...userData } = user;
    res.json({ user: userData, message: "Submitted for admin review" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/documents", async (req, res) => {
  try {
    const { type, url, fileName } = req.body;

    if (!type || !url || !fileName) {
      return res.status(400).json({ error: "type, url, and fileName are required" });
    }

    const validTypes = [
      "business_registration", "company_logo", "resume",
      "gst_certificate", "professional_license", "other",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid document type" });
    }

    const doc = await prisma.userDocument.create({
      data: {
        userId: req.user.id,
        type,
        url,
        fileName,
      },
    });

    if (type === "company_logo") {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { companyLogo: url },
      });
    }
    if (type === "business_registration") {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { businessRegistrationDoc: url },
      });
    }
    if (type === "resume") {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { resumeUrl: url },
      });
    }

    res.status(201).json({ document: doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/documents", async (req, res) => {
  try {
    const docs = await prisma.userDocument.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({ documents: docs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
