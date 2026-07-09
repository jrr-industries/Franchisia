import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.ts";
import prisma from "../prisma.js";

const router = Router();

const getSession = async (req) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session?.user?.id) return null;
  return session;
};

router.put("/franchisor", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Authentication required" });

    const { companyName, brandName, website, industry, businessRegistrationNumber, gstNumber, businessEmail, businessAddress, numberOfOutlets, yearsInBusiness, companyDescription } = req.body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: "franchisor",
        companyName,
        brandName,
        website,
        preferredIndustry: industry,
        businessRegistrationNumber,
        gstNumber: gstNumber || null,
        businessEmail,
        location: businessAddress,
        numberOfOutlets: numberOfOutlets ? parseInt(numberOfOutlets) : null,
        yearsInBusiness: yearsInBusiness ? parseInt(yearsInBusiness) : null,
        companyDescription,
        accountStatus: "pending_admin_review",
      },
    });

    const { passwordHash, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    console.error("Franchisor onboarding error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/franchisee", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Authentication required" });

    const { phone, city, country, investmentBudget, preferredIndustry, businessExperience, linkedinProfile } = req.body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: "franchisee",
        phone,
        preferredLocation: city,
        location: country,
        investmentCapacity: investmentBudget ? parseFloat(investmentBudget.replace(/[^0-9.]/g, '')) : null,
        preferredIndustry,
        headline: businessExperience,
        linkedinUrl: linkedinProfile || null,
        accountStatus: "verified",
        onboardingCompleted: true,
      },
    });

    const { passwordHash, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    console.error("Franchisee onboarding error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/supplier", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Authentication required" });

    const { companyName, servicesOffered, website, gstNumber, businessAddress, contactPerson } = req.body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: "supplier",
        companyName,
        headline: servicesOffered,
        website,
        gstNumber: gstNumber || null,
        location: businessAddress,
        contactPerson,
        accountStatus: "pending_admin_review",
      },
    });

    const { passwordHash, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    console.error("Supplier onboarding error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/consultant", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Authentication required" });

    const { consultancyName, yearsOfExperience, certifications, linkedinProfile, website } = req.body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: "consultant",
        consultancyName,
        experienceYears: yearsOfExperience ? parseInt(yearsOfExperience) : null,
        certifications,
        linkedinUrl: linkedinProfile,
        website,
        accountStatus: "pending_admin_review",
      },
    });

    const { passwordHash, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    console.error("Consultant onboarding error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/investor", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Authentication required" });

    const { investmentRange, interestedIndustries, company, linkedinProfile } = req.body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: "investor",
        investmentRange,
        preferredIndustry: interestedIndustries,
        companyName: company || null,
        linkedinUrl: linkedinProfile || null,
        accountStatus: "verified",
        onboardingCompleted: true,
      },
    });

    const { passwordHash, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    console.error("Investor onboarding error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/documents", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Authentication required" });

    const { type, url, fileName } = req.body;

    const doc = await prisma.userDocument.create({
      data: {
        userId: session.user.id,
        type: type || "business_registration",
        url,
        fileName: fileName || "document",
      },
    });

    res.json({ document: doc });
  } catch (error) {
    console.error("Document upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/submit-for-review", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Authentication required" });

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        accountStatus: "pending_admin_review",
        submittedForReviewAt: new Date(),
      },
    });

    const { passwordHash, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    console.error("Submit for review error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/complete", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Authentication required" });

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