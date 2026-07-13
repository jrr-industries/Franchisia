import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        skills: true,
        interests: true,
        education: true,
        experience: true,
      },
    });
    const { passwordHash, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error("Users route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/me", authenticate, async (req, res) => {
  try {
    const {
      fullName, name: reqName, headline, bio, phone, location, country, state, city,
      website, linkedinUrl, investmentCapacity, industries, experienceYears,
      companyName, brandName, gstNumber, businessEmail, businessRegistrationNumber,
      numberOfOutlets, yearsInBusiness, companyDescription, contactPerson,
      consultancyName, certifications, preferredIndustry, investmentRange,
      companyLogo, companyBanner,
    } = req.body;

    const data = {};
    if (fullName || reqName) data.name = fullName || reqName;
    if (headline !== undefined) data.headline = headline;
    if (bio !== undefined) data.bio = bio;
    if (phone !== undefined) data.phone = phone;
    if (location !== undefined) data.location = location;
    if (country !== undefined) data.country = country;
    if (state !== undefined) data.state = state;
    if (city !== undefined) data.city = city;
    if (website !== undefined) data.website = website;
    if (linkedinUrl !== undefined) data.linkedinUrl = linkedinUrl;
    if (investmentCapacity !== undefined) data.investmentCapacity = investmentCapacity;
    if (industries !== undefined) data.industries = industries;
    if (experienceYears !== undefined) data.experienceYears = experienceYears;
    if (companyName !== undefined) data.companyName = companyName;
    if (brandName !== undefined) data.brandName = brandName;
    if (gstNumber !== undefined) data.gstNumber = gstNumber;
    if (businessEmail !== undefined) data.businessEmail = businessEmail;
    if (businessRegistrationNumber !== undefined) data.businessRegistrationNumber = businessRegistrationNumber;
    if (numberOfOutlets !== undefined) data.numberOfOutlets = numberOfOutlets ? parseInt(numberOfOutlets) : null;
    if (yearsInBusiness !== undefined) data.yearsInBusiness = yearsInBusiness ? parseInt(yearsInBusiness) : null;
    if (companyDescription !== undefined) data.companyDescription = companyDescription;
    if (contactPerson !== undefined) data.contactPerson = contactPerson;
    if (consultancyName !== undefined) data.consultancyName = consultancyName;
    if (certifications !== undefined) data.certifications = certifications;
    if (preferredIndustry !== undefined) data.preferredIndustry = preferredIndustry;
    if (investmentRange !== undefined) data.investmentRange = investmentRange;
    if (companyLogo !== undefined) data.companyLogo = companyLogo;
    if (companyBanner !== undefined) data.companyBanner = companyBanner;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });
    const { passwordHash, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error("Users route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, image: true, headline: true, bio: true,
        location: true, country: true, state: true, city: true, website: true, linkedinUrl: true, industries: true,
        experienceYears: true, role: true, skills: true, education: true,
        experience: true, createdAt: true, followerCount: true, followingCount: true,
        verified: true, accountStatus: true, companyName: true, brandName: true, phone: true,
        companyDescription: true, companyLogo: true, companyBanner: true,
        businessEmail: true, businessRegistrationNumber: true, gstNumber: true,
        numberOfOutlets: true, yearsInBusiness: true, contactPerson: true,
        consultancyName: true, certifications: true, preferredIndustry: true,
        investmentRange: true, investmentCapacity: true,
        _count: { select: { receivedConnections: true, sentConnections: true } },
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Users route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true, name: true, image: true, headline: true,
          location: true, country: true, state: true, city: true,
          role: true, industries: true, createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Users route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
