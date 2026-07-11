import "dotenv/config";
import { PrismaClient } from "../server/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const FRANCHISOR_ID = "5swYygNKkPHE6PQAOhDanmswhgVacgpT";

const companies = [
  { name: "McDonald's", slug: "mcdonalds", industry: "Fast Food", description: "World's leading fast food chain with franchise opportunities worldwide.", logoUrl: null, isVerified: true, city: "Chicago", country: "USA" },
  { name: "Subway", slug: "subway", industry: "Fast Food", description: "Largest submarine sandwich chain with flexible franchise models.", logoUrl: null, isVerified: true, city: "Milford", country: "USA" },
  { name: "7-Eleven", slug: "7-eleven", industry: "Retail", description: "Global convenience store chain offering turnkey franchise opportunities.", logoUrl: null, isVerified: true, city: "Irving", country: "USA" },
  { name: "KFC", slug: "kfc", industry: "Fast Food", description: "Famous fried chicken franchise with global brand recognition.", logoUrl: null, isVerified: true, city: "Louisville", country: "USA" },
  { name: "Domino's Pizza", slug: "dominos-pizza", industry: "Fast Food", description: "World leader in pizza delivery with proven franchise system.", logoUrl: null, isVerified: true, city: "Ann Arbor", country: "USA" },
  { name: "Hilton Hotels", slug: "hilton-hotels", industry: "Hospitality", description: "Prestigious hotel chain with luxury and mid-scale franchise models.", logoUrl: null, isVerified: true, city: "McLean", country: "USA" },
  { name: "Anytime Fitness", slug: "anytime-fitness", industry: "Health & Fitness", description: "24/7 fitness franchise with global footprint and low overhead.", logoUrl: null, isVerified: true, city: "Woodbury", country: "USA" },
  { name: "RE/MAX", slug: "remax", industry: "Real Estate", description: "Leading real estate franchise network with global presence.", logoUrl: null, isVerified: true, city: "Denver", country: "USA" },
  { name: "Uber Eats", slug: "uber-eats", industry: "Technology", description: "On-demand food delivery platform with partnership opportunities.", logoUrl: null, isVerified: true, city: "San Francisco", country: "USA" },
  { name: "The UPS Store", slug: "the-ups-store", industry: "Logistics", description: "Retail shipping and business services franchise with strong brand.", logoUrl: null, isVerified: true, city: "San Diego", country: "USA" },
];

async function main() {
  console.log("Seeding companies...");
  for (const c of companies) {
    await prisma.company.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        ownerId: FRANCHISOR_ID,
        ...c,
        status: "active",
        employeeCount: "10,000+",
      },
    });
  }
  const count = await prisma.company.count();
  console.log(`Done. ${count} companies in database.`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
