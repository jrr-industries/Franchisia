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

  const sectionContent = [
    { key: "section_featured_companies_heading", value: { text: "Featured Franchise Brands" } },
    { key: "section_featured_companies_description", value: { text: "Top-rated franchisors actively looking for partners." } },
    { key: "section_featured_listings_heading", value: { text: "Featured Opportunities" } },
    { key: "section_featured_listings_description", value: { text: "Hand-picked franchise opportunities with verified potential." } },
    { key: "section_testimonials_heading", value: { text: "What Our Users Say" } },
    { key: "section_testimonials_description", value: { text: "Join thousands of professionals who have found success on Franchisia." } },
    { key: "section_blog_heading", value: { text: "Latest from Our Blog" } },
    { key: "section_blog_description", value: { text: "Insights, tips, and stories to help you make smarter franchise decisions." } },
    { key: "section_events_heading", value: { text: "Upcoming Events" } },
    { key: "section_events_description", value: { text: "Join us at industry events, webinars, and networking sessions." } },
    { key: "section_careers_heading", value: { text: "Join Our Team" } },
    { key: "section_careers_description", value: { text: "Help us shape the future of franchising. Explore current openings." } },
    { key: "section_partners_heading", value: { text: "Our Partners" } },
    { key: "section_partners_description", value: { text: "Collaborating with industry leaders to deliver the best franchise experience." } },
    { key: "section_media_heading", value: { text: "Media Gallery" } },
    { key: "section_media_description", value: { text: "Photos and videos from our community." } },
    { key: "section_pricing_heading", value: { text: "Simple, Transparent Pricing" } },
    { key: "section_pricing_description", value: { text: "Choose the plan that fits your needs. No hidden fees." } },
    { key: "section_faq_heading", value: { text: "Frequently Asked Questions" } },
    { key: "section_faq_description", value: { text: "Got questions? We've got answers." } },
    { key: "section_contact_heading", value: { text: "Get in Touch" } },
    { key: "section_contact_description", value: { text: "Have questions? We'd love to hear from you." } },
    { key: "section_search_heading", value: { text: "Find Your Next Opportunity" } },
    { key: "section_search_description", value: { text: "Browse hundreds of franchise opportunities. Filter by industry, location, and investment range." } },
    { key: "section_industries_heading", value: { text: "Explore by Industry" } },
    { key: "section_featured_cities_heading", value: { text: "Opportunities by City" } },
    { key: "section_featured_cities_description", value: { text: "Explore franchise opportunities in top business hubs across India." } },
    { key: "section_newsletter_heading", value: { text: "Stay Updated" } },
    { key: "section_newsletter_description", value: { text: "Get the latest franchise opportunities, industry insights, and platform updates delivered to your inbox." } },
    { key: "section_statistics_heading", value: { text: "Platform Statistics" } },
  ];

  for (const s of sectionContent) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value },
    });
  }

  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
