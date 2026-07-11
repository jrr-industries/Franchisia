import "dotenv/config";
import { PrismaClient } from "../server/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const adminHash = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@franchisia.com" },
    update: {
      role: "admin",
      emailVerified: true,
      onboardingCompleted: true,
    },
    create: {
      email: "admin@franchisia.com",
      passwordHash: adminHash,
      name: "Admin User",
      role: "admin",
      emailVerified: true,
      onboardingCompleted: true,
    },
  });

  await prisma.siteContact.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      email: "hello@franchisia.com",
      phone: "+1 (555) 123-4567",
      address: "San Francisco, CA",
    },
  });

  const stats = [
    { value: "10,000+", label: "Active Franchise Listings", sort: 1 },
    { value: "50,000+", label: "Registered Professionals", sort: 2 },
    { value: "2,500+", label: "Verified Franchisors", sort: 3 },
    { value: "15,000+", label: "Successful Matches", sort: 4 },
    { value: "$2.5B+", label: "Total Investment Facilitated", sort: 5 },
    { value: "98%", label: "Satisfaction Rate", sort: 6 },
  ];

  for (const stat of stats) {
    await prisma.siteStat.create({ data: stat });
  }

  const aboutPages = [
    { section: "hero_title", content: "Building the Future of Franchise Networking" },
    { section: "hero_desc", content: "Franchisia is the leading professional network connecting franchisors, franchisees, consultants, investors, and suppliers worldwide." },
    { section: "mission", content: "To democratize access to franchise opportunities and create a transparent, efficient ecosystem where every professional can find the perfect match." },
    { section: "vision", content: "A world where franchise opportunities are accessible to everyone, empowering entrepreneurs to build successful businesses through meaningful connections." },
  ];

  for (const page of aboutPages) {
    await prisma.aboutPage.upsert({
      where: { section: page.section },
      update: {},
      create: page,
    });
  }

  const team = [
    { name: "Alexandra Reed", role: "CEO & Founder", bio: "Former franchisor with 15+ years of experience in the franchise industry.", sort: 1 },
    { name: "Marcus Chen", role: "CTO", bio: "Tech leader who built scalable platforms for Fortune 500 companies.", sort: 2 },
    { name: "Sophia Patel", role: "COO", bio: "Operations expert with a background in franchise development.", sort: 3 },
    { name: "James Mitchell", role: "VP of Sales", bio: "Helped over 200 franchise brands expand their networks.", sort: 4 },
    { name: "Olivia Torres", role: "Head of Marketing", bio: "Digital marketing strategist specializing in franchise growth.", sort: 5 },
    { name: "Ryan Kim", role: "Head of Product", bio: "Product leader passionate about building intuitive user experiences.", sort: 6 },
  ];

  for (const member of team) {
    await prisma.aboutTeam.create({ data: member });
  }

  const timeline = [
    { year: "2019", title: "The Idea", desc: "Founded with a vision to transform the franchise industry.", sort: 1 },
    { year: "2020", title: "Platform Launch", desc: "Launched the first version of Franchisia with 500 listings.", sort: 2 },
    { year: "2021", title: "10K Users", desc: "Reached 10,000 registered professionals on the platform.", sort: 3 },
    { year: "2022", title: "Global Expansion", desc: "Expanded operations to 20 countries worldwide.", sort: 4 },
    { year: "2023", title: "AI Features", desc: "Introduced AI-powered matching and investment calculators.", sort: 5 },
    { year: "2024", title: "Industry Leader", desc: "Recognized as the #1 franchise networking platform.", sort: 6 },
  ];

  for (const item of timeline) {
    await prisma.aboutTimeline.create({ data: item });
  }

  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
