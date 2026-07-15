import prisma from "./prisma.js";

export async function getSiteContent() {
  const [stats, testimonials, partners, faqs, plans, blogPosts, heroSettings, industries, aiSection, globalNetwork, mapLocation, globalMetrics, newsletterSettings, footerSettings, marketplaceSearch, features, userTypes, howItWorks, featuredCities, careers, events, mediaItems] = await Promise.all([
    prisma.siteStat.findMany({ orderBy: { sort: "asc" } }),
    prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.partner.findMany({ where: { status: "published" }, orderBy: { displayOrder: "asc" } }),
    prisma.siteFAQ.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.plan.findMany({ where: { status: "published" }, orderBy: { displayOrder: "asc" } }),
    prisma.blogPost.findMany({ where: { status: "published" }, orderBy: { publishDate: "desc" }, take: 6 }),
    prisma.heroSetting.findFirst({ where: { status: "published", isActive: true } }),
    prisma.industry.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" } }),
    prisma.aISection.findFirst({ where: { isActive: true } }),
    prisma.globalNetwork.findFirst({ where: { isActive: true } }),
    prisma.mapLocation.findFirst({ where: { isActive: true } }),
    prisma.globalMetric.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" } }),
    prisma.newsletterSetting.findFirst({ where: { isActive: true } }),
    prisma.footerSetting.findFirst({ where: { isActive: true } }),
    prisma.marketplaceSearchSetting.findFirst({ where: { isActive: true } }),
    prisma.feature.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }),
    prisma.userType.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }),
    prisma.howItWork.findMany({ where: { isPublished: true }, orderBy: { stepNumber: "asc" } }),
    prisma.featuredCity.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.career.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" } }),
    prisma.event.findMany({ orderBy: { date: "asc" } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const contact = await prisma.siteContact.findFirst();
  const settings = await prisma.siteSetting.findMany();
  const settingsMap = {};
  settings.forEach(s => { settingsMap[s.key] = s.value; });

  return {
    stats,
    testimonials,
    partners,
    faqs,
    plans,
    blogPosts,
    heroSettings,
    industries,
    aiSection,
    globalNetwork,
    mapLocation,
    globalMetrics,
    newsletterSettings,
    footerSettings,
    marketplaceSearch,
    features,
    userTypes,
    howItWorks,
    featuredCities,
    careers,
    events,
    media: mediaItems,
    contact,
    settings: settingsMap,
  };
}

export async function setSiteContent(updates) {
  const results = {};
  if (updates.stats) {
    await prisma.siteStat.deleteMany();
    for (const [i, stat] of updates.stats.entries()) {
      const created = await prisma.siteStat.create({
        data: { value: stat.value, label: stat.label, sort: i },
      });
      results.stats = results.stats || [];
      results.stats.push(created);
    }
  }
  if (updates.testimonials) {
    await prisma.testimonial.deleteMany();
    for (const t of updates.testimonials) {
      const created = await prisma.testimonial.create({
        data: { name: t.name, role: t.role, review: t.text || t.review, rating: t.rating || 5, isFeatured: true },
      });
      results.testimonials = results.testimonials || [];
      results.testimonials.push(created);
    }
  }
  if (updates.brands) {
    await prisma.siteSetting.upsert({
      where: { key: "brands" },
      update: { value: updates.brands },
      create: { key: "brands", value: updates.brands },
    });
    results.brands = updates.brands;
  }
  if (updates.contact) {
    const existing = await prisma.siteContact.findFirst();
    if (existing) {
      await prisma.siteContact.update({
        where: { id: existing.id },
        data: { email: updates.contact.email, phone: updates.contact.phone, address: updates.contact.address },
      });
    } else {
      await prisma.siteContact.create({
        data: { email: updates.contact.email, phone: updates.contact.phone, address: updates.contact.address },
      });
    }
    results.contact = updates.contact;
  }
  return results;
}
