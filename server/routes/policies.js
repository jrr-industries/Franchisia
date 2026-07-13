import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { auth } from "../lib/auth.ts";
import { fromNodeHeaders } from "better-auth/node";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "public", "uploads", "policies");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${path.extname(file.originalname)}`),
});

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

const router = Router();

const requireFranchisor = (req, res, next) => {
  if (req.user?.role !== "franchisor") {
    return res.status(403).json({ error: "Only franchisors can manage policies" });
  }
  next();
};

function canAccessPolicy(req, policy) {
  return policy.companyId === req.user.companyId || req.user.role === "admin";
}

router.get("/my", authenticate, async (req, res) => {
  try {
    const company = await prisma.company.findFirst({
      where: { ownerId: req.user.id },
    });
    if (!company) return res.json({ policy: null });

    const policy = await prisma.companyPolicy.findFirst({
      where: { companyId: company.id },
      include: {
        faqs: { orderBy: { sortOrder: "asc" } },
        documents: true,
        versions: { orderBy: { createdAt: "desc" } },
        _count: { select: { acceptances: true } },
      },
    });
    res.json({ policy, companyId: company.id });
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/company/:companyId", async (req, res) => {
  try {
    const policy = await prisma.companyPolicy.findFirst({
      where: { companyId: req.params.companyId, isSuspended: false },
      include: {
        faqs: { orderBy: { sortOrder: "asc" } },
        documents: { where: { isHidden: false } },
      },
    });
    if (!policy) return res.json({ policy: null });

    let viewerId = null;
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      viewerId = session?.user?.id || null;
    } catch {}

    const company = await prisma.company.findUnique({
      where: { id: req.params.companyId },
      select: { ownerId: true },
    });

    const isOwner = company && viewerId === company.ownerId;

    if (!isOwner && policy.status !== "published") {
      return res.json({ policy: null });
    }

    res.json({ policy });
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const POLICY_FIELDS = [
  "minimumAge", "minimumEducation", "businessExperienceRequired", "netWorthRequired",
  "preferredIndustries", "commercialSpaceRequired", "businessRegistrationRequired",
  "gstRequired", "localLicenseRequired", "additionalRequirements",
  "minimumInvestment", "maximumInvestment", "franchiseFee", "royaltyFee",
  "marketingFee", "workingCapital", "securityDeposit", "expectedROI", "breakEvenPeriod",
  "agreementDuration", "renewalAvailable", "terminationConditions", "exitPolicy",
  "transferPolicy", "renewalCharges",
  "initialTraining", "onSiteSupport", "marketingSupport", "technologySupport",
  "operationsManual", "storeSetupSupport", "hiringSupport", "supplyChainSupport",
  "exclusiveTerritory", "nonExclusiveTerritory", "expansionPlans",
  "targetCities", "targetStates", "targetCountries",
  "refundPolicy", "cancellationPolicy", "brandGuidelines", "trademarkRules",
  "confidentialityAgreement", "codeOfConduct",
];

function pickPolicyFields(body) {
  const picked = {};
  POLICY_FIELDS.forEach((f) => {
    if (body[f] !== undefined) picked[f] = body[f];
  });
  return picked;
}

router.post("/", authenticate, requireFranchisor, async (req, res) => {
  try {
    const company = await prisma.company.findFirst({
      where: { ownerId: req.user.id },
    });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const existing = await prisma.companyPolicy.findFirst({
      where: { companyId: company.id },
    });
    if (existing) return res.status(409).json({ error: "Policy already exists" });

    const policy = await prisma.companyPolicy.create({
      data: {
        companyId: company.id,
        ...pickPolicyFields(req.body),
      },
      include: { faqs: true, documents: true, versions: true },
    });

    await prisma.companyPolicyVersion.create({
      data: {
        policyId: policy.id,
        version: "1.0",
        data: policy,
        description: "Initial version",
      },
    });

    res.status(201).json(policy);
  } catch (error) {
    console.error("Policies POST error:", error);
    console.error("Request body:", JSON.stringify(req.body));
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

router.put("/:id", authenticate, requireFranchisor, async (req, res) => {
  try {
    const policy = await prisma.companyPolicy.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });
    if (!policy) return res.status(404).json({ error: "Policy not found" });
    if (policy.company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updated = await prisma.companyPolicy.update({
      where: { id: req.params.id },
      data: pickPolicyFields(req.body),
      include: { faqs: { orderBy: { sortOrder: "asc" } }, documents: true },
    });
    res.json(updated);
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/publish", authenticate, requireFranchisor, async (req, res) => {
  try {
    const policy = await prisma.companyPolicy.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });
    if (!policy) return res.status(404).json({ error: "Policy not found" });
    if (policy.company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const currentVersion = parseFloat(policy.version) || 1.0;
    const newVersion = policy.status === "published"
      ? (currentVersion + 0.1).toFixed(1)
      : policy.version;

    const updated = await prisma.companyPolicy.update({
      where: { id: req.params.id },
      data: {
        status: "published",
        isActive: true,
        publishedAt: new Date(),
        version: newVersion,
      },
    });

    const fullPolicy = await prisma.companyPolicy.findUnique({
      where: { id: req.params.id },
      include: { faqs: true, documents: true },
    });

    await prisma.companyPolicyVersion.create({
      data: {
        policyId: req.params.id,
        version: newVersion,
        data: fullPolicy,
        description: req.body.description || `Policy v${newVersion}`,
        publishedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/archive", authenticate, requireFranchisor, async (req, res) => {
  try {
    const policy = await prisma.companyPolicy.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });
    if (!policy) return res.status(404).json({ error: "Policy not found" });
    if (policy.company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updated = await prisma.companyPolicy.update({
      where: { id: req.params.id },
      data: { status: "archived", isActive: false },
    });
    res.json(updated);
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/versions", authenticate, async (req, res) => {
  try {
    const policy = await prisma.companyPolicy.findUnique({
      where: { id: req.params.id },
      select: { companyId: true },
    });
    if (!policy) return res.status(404).json({ error: "Policy not found" });

    const versions = await prisma.companyPolicyVersion.findMany({
      where: { policyId: req.params.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(versions);
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/faqs", authenticate, requireFranchisor, async (req, res) => {
  try {
    const policy = await prisma.companyPolicy.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });
    if (!policy) return res.status(404).json({ error: "Policy not found" });
    if (policy.company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const maxSort = await prisma.companyFAQ.findFirst({
      where: { policyId: req.params.id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const faq = await prisma.companyFAQ.create({
      data: {
        policyId: req.params.id,
        question: req.body.question,
        answer: req.body.answer,
        sortOrder: (maxSort?.sortOrder ?? -1) + 1,
      },
    });
    res.status(201).json(faq);
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id/faqs/:faqId", authenticate, requireFranchisor, async (req, res) => {
  try {
    const faq = await prisma.companyFAQ.findUnique({
      where: { id: req.params.faqId },
      include: { policy: { include: { company: true } } },
    });
    if (!faq) return res.status(404).json({ error: "FAQ not found" });
    if (faq.policy.company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updated = await prisma.companyFAQ.update({
      where: { id: req.params.faqId },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id/faqs/:faqId", authenticate, requireFranchisor, async (req, res) => {
  try {
    const faq = await prisma.companyFAQ.findUnique({
      where: { id: req.params.faqId },
      include: { policy: { include: { company: true } } },
    });
    if (!faq) return res.status(404).json({ error: "FAQ not found" });
    if (faq.policy.company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    await prisma.companyFAQ.delete({ where: { id: req.params.faqId } });
    res.json({ success: true });
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/documents", authenticate, requireFranchisor, upload.single("file"), async (req, res) => {
  try {
    const policy = await prisma.companyPolicy.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });
    if (!policy) return res.status(404).json({ error: "Policy not found" });
    if (policy.company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const url = `/uploads/policies/${req.file.filename}`;
    const doc = await prisma.companyDocument.create({
      data: {
        policyId: req.params.id,
        type: req.body.type || "other",
        title: req.body.title || req.file.originalname,
        url,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
    res.status(201).json(doc);
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id/documents/:docId", authenticate, requireFranchisor, async (req, res) => {
  try {
    const doc = await prisma.companyDocument.findUnique({
      where: { id: req.params.docId },
      include: { policy: { include: { company: true } } },
    });
    if (!doc) return res.status(404).json({ error: "Document not found" });
    if (doc.policy.company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const filePath = path.join(uploadDir, path.basename(doc.url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.companyDocument.delete({ where: { id: req.params.docId } });
    res.json({ success: true });
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/acceptance", authenticate, async (req, res) => {
  try {
    const acceptance = await prisma.companyPolicyAcceptance.findUnique({
      where: {
        policyId_userId: { policyId: req.params.id, userId: req.user.id },
      },
    });
    res.json({ accepted: !!acceptance, acceptance });
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/accept", authenticate, async (req, res) => {
  try {
    const policy = await prisma.companyPolicy.findUnique({
      where: { id: req.params.id },
    });
    if (!policy) return res.status(404).json({ error: "Policy not found" });

    const existing = await prisma.companyPolicyAcceptance.findUnique({
      where: { policyId_userId: { policyId: req.params.id, userId: req.user.id } },
    });
    if (existing) return res.json(existing);

    const acceptance = await prisma.companyPolicyAcceptance.create({
      data: {
        policyId: req.params.id,
        userId: req.user.id,
        listingId: req.body.listingId || null,
        policyVersion: policy.version,
      },
    });
    res.status(201).json(acceptance);
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/policies", authenticate, authorize("admin"), async (req, res) => {
  try {
    const policies = await prisma.companyPolicy.findMany({
      include: {
        company: { select: { id: true, name: true, slug: true, ownerId: true } },
        _count: { select: { documents: true, acceptances: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(policies);
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const policy = await prisma.companyPolicy.findUnique({
      where: { id: req.params.id },
      include: {
        company: { select: { id: true, name: true, slug: true, ownerId: true } },
        faqs: { orderBy: { sortOrder: "asc" } },
        documents: true,
        _count: { select: { acceptances: true } },
      },
    });
    if (!policy) return res.status(404).json({ error: "Policy not found" });
    res.json(policy);
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/:id/suspend", authenticate, authorize("admin"), async (req, res) => {
  try {
    const updated = await prisma.companyPolicy.update({
      where: { id: req.params.id },
      data: { isSuspended: req.body.suspended },
    });
    res.json(updated);
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/:id/versions", authenticate, authorize("admin"), async (req, res) => {
  try {
    const versions = await prisma.companyPolicyVersion.findMany({
      where: { policyId: req.params.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(versions);
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/documents/:docId/hide", authenticate, authorize("admin"), async (req, res) => {
  try {
    const updated = await prisma.companyDocument.update({
      where: { id: req.params.docId },
      data: { isHidden: req.body.hidden },
    });
    res.json(updated);
  } catch (error) {
    console.error("Policies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
