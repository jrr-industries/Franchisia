import prisma from "./prisma.js";

async function safeQuery(fn, fallback = null) {
  try { return await fn(); } catch (e) { console.error("Query failed:", e.message); return fallback; }
}

export async function getSiteContent() {
  const defaults = { items: [] };
  const [
    stats, testimonials, partners, faqs, plans, blogPosts,
    heroSettings, industries, aiSection, globalNetwork, mapLocation,
    globalMetrics, newsletterSettings, footerSettings, marketplaceSearch,
    features, userTypes, howItWorks, featuredCities, careers, events, mediaItems,
  ] = await Promise.all([
    safeQuery(() => prisma.siteStat.findMany({ orderBy: { sort: "asc" } }), []),
    safeQuery(() => prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } }), []),
    safeQuery(() => prisma.partner.findMany({ where: { status: "published" }, orderBy: { displayOrder: "asc" } }), []),
    safeQuery(() => prisma.siteFAQ.findMany({ orderBy: { displayOrder: "asc" } }), []),
    safeQuery(() => prisma.plan.findMany({ where: { status: "published" }, orderBy: { displayOrder: "asc" } }), []),
    safeQuery(() => prisma.blogPost.findMany({ where: { status: "published" }, orderBy: { publishDate: "desc" }, take: 6 }), []),
    safeQuery(() => prisma.heroSetting.findFirst({ where: { status: "published", isActive: true } }), null),
    safeQuery(() => prisma.industry.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" } }), []),
    safeQuery(() => prisma.aISection.findFirst({ where: { isActive: true } }), null),
    safeQuery(() => prisma.globalNetwork.findFirst({ where: { isActive: true } }), null),
    safeQuery(() => prisma.mapLocation.findFirst({ where: { isActive: true } }), null),
    safeQuery(() => prisma.globalMetric.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" } }), []),
    safeQuery(() => prisma.newsletterSetting.findFirst({ where: { isActive: true } }), null),
    safeQuery(() => prisma.footerSetting.findFirst({ where: { isActive: true } }), null),
    safeQuery(() => prisma.marketplaceSearchSetting.findFirst({ where: { isActive: true } }), null),
    safeQuery(() => prisma.feature.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }), []),
    safeQuery(() => prisma.userType.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }), []),
    safeQuery(() => prisma.howItWork.findMany({ where: { isPublished: true }, orderBy: { stepNumber: "asc" } }), []),
    safeQuery(() => prisma.featuredCity.findMany({ orderBy: { displayOrder: "asc" } }), []),
    safeQuery(() => prisma.career.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" } }), []),
    safeQuery(() => prisma.event.findMany({ orderBy: { date: "asc" } }), []),
    safeQuery(() => prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 20 }), []),
  ]);

  const contact = await safeQuery(() => prisma.siteContact.findFirst(), null);
  const settings = await safeQuery(() => prisma.siteSetting.findMany(), []);
  const settingsMap = {};
  if (settings) settings.forEach(s => { settingsMap[s.key] = s.value; });

  return {
    stats, testimonials, partners, faqs, plans, blogPosts,
    heroSettings, industries, aiSection, globalNetwork, mapLocation,
    globalMetrics, newsletterSettings, footerSettings, marketplaceSearch,
    features, userTypes, howItWorks, featuredCities, careers, events,
    media: mediaItems, contact, settings: settingsMap,
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
