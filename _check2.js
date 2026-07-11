import prisma from "./server/prisma.js";

// Check what GET /api/companies?franchisor=true returns
const companies = await prisma.company.findMany({
  where: {
    status: "active",
    owner: { role: "franchisor", isActive: true }
  },
  include: {
    owner: { select: { id: true, email: true, name: true, role: true, isActive: true } },
    _count: { select: { followers: true, listings: true, reviews: true } }
  },
  orderBy: { createdAt: "desc" }
});

console.log(`Count: ${companies.length}`);
for (const c of companies) {
  console.log(JSON.stringify({
    id: c.id, name: c.name, slug: c.slug, status: c.status,
    industry: c.industry, isVerified: c.isVerified,
    owner: c.owner,
    _count: c._count
  }, null, 2));
}
await prisma.$disconnect();
