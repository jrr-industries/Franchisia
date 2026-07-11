import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.ts";
import prisma from "../prisma.js";
import { emitCompanyCreated } from "../socket.js";

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
    const userId = session.user.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        role: "franchisor",
        companyName,
        brandName,
        website,
        preferredIndustry: industry,
        industries: industry ? [industry] : [],
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

    if (companyName) {
      const baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const slug = baseSlug + "-" + userId.slice(0, 6);
      const existing = await prisma.company.findFirst({ where: { ownerId: userId } });
      if (existing) {
        const updated = await prisma.company.update({
          where: { id: existing.id },
          data: { name: companyName, industry: industry || "Other", slug, description: companyDescription || null, website: website || null, email: businessEmail || null, address: businessAddress || null },
        });
        emitCompanyCreated(updated);
      } else {
        const company = await prisma.company.create({
          data: {
            ownerId: userId,
            name: companyName,
            slug,
            industry: industry || "Other",
            description: companyDescription || null,
            website: website || null,
            email: businessEmail || null,
            address: businessAddress || null,
            status: "pending",
          },
        });
        emitCompanyCreated(company);
      }
    }

    const { passwordHash, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    console.error("Franchisor onboarding error:", error);
    console.error("Onboarding route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/franchisee", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Authentication required" });

    const { phone, city, country, state: formState, investmentBudget, preferredIndustry, businessExperience, linkedinProfile } = req.body;

    const locationStr = [city, formState, country].filter(Boolean).join(', ');

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: "franchisee",
        phone,
        city,
        state: formState || null,
        country: country || null,
        location: locationStr,
        investmentCapacity: investmentBudget ? parseFloat(investmentBudget.replace(/[^0-9.]/g, '')) : null,
        preferredIndustry,
        industries: preferredIndustry ? [preferredIndustry] : [],
        headline: businessExperience,
        linkedinUrl: linkedinProfile || null,
        accountStatus: "pending_admin_review",
      },
    });

    const { passwordHash, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    console.error("Franchisee onboarding error:", error);
    console.error("Onboarding route error:", error);
    res.status(500).json({ error: "Internal server error" });
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
    console.error("Onboarding route error:", error);
    res.status(500).json({ error: "Internal server error" });
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
    console.error("Onboarding route error:", error);
    res.status(500).json({ error: "Internal server error" });
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
        industries: interestedIndustries ? [interestedIndustries] : [],
        companyName: company || null,
        linkedinUrl: linkedinProfile || null,
        accountStatus: "pending_admin_review",
      },
    });

    const { passwordHash, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    console.error("Investor onboarding error:", error);
    console.error("Onboarding route error:", error);
    res.status(500).json({ error: "Internal server error" });
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
    console.error("Onboarding route error:", error);
    res.status(500).json({ error: "Internal server error" });
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
    console.error("Onboarding route error:", error);
    res.status(500).json({ error: "Internal server error" });
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
    console.error("Onboarding route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/create-company", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: "Authentication required" });

    const userId = session.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== "franchisor") return res.status(400).json({ error: "Only franchisors can create a company" });

    const existing = await prisma.company.findFirst({ where: { ownerId: userId } });
    if (existing) {
      return res.status(409).json({ error: "Company already exists", company: existing });
    }

    const { companyName, industry, companyDescription, website, businessEmail, businessAddress } = req.body;

    if (!companyName) {
      return res.status(400).json({ error: "Company name is required" });
    }

    const baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const slug = baseSlug + "-" + userId.slice(0, 6);

    const company = await prisma.company.create({
      data: {
        ownerId: userId,
        name: companyName,
        slug,
        industry: industry || "Other",
        description: companyDescription || null,
        website: website || null,
        email: businessEmail || null,
        address: businessAddress || null,
        status: "pending",
      },
    });

    emitCompanyCreated(company);

    res.status(201).json({ company, message: "Company created successfully" });
  } catch (error) {
    console.error("Create company error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;