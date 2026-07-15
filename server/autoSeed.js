import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

export async function autoSeed() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const [heroCount, statCount, faqCount, planCount] = await Promise.all([
      prisma.heroSetting.count(),
      prisma.siteStat.count(),
      prisma.siteFAQ.count(),
      prisma.plan.count(),
    ]);

    if (heroCount === 0 || statCount === 0 || faqCount === 0 || planCount === 0) {
      console.log("CMS tables appear empty. Running seed...");
      const { execSync } = await import("child_process");
      execSync("npx tsx prisma/seed.js", { stdio: "inherit", cwd: process.cwd() });
      console.log("Auto-seed complete.");
    } else {
      console.log(`CMS already seeded (${heroCount} heroes, ${statCount} stats, ${faqCount} faqs, ${planCount} plans).`);
    }
  } catch (err) {
    console.error("Auto-seed check failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}
