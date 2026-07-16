import { Router } from "express";
import prisma from "../prisma.js";
import { getMaintenanceMode } from "../settings.js";
import { getSiteContent } from "../site-content.js";

const router = Router();

router.get("/stats", async (_req, res) => {
  try {
    const stats = await prisma.siteStat.findMany({ orderBy: { sort: "asc" } });
    res.json(stats);
  } catch (error) {
    console.error("Public route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/contact", async (_req, res) => {
  try {
    const contact = await prisma.siteContact.findFirst();
    res.json(contact);
  } catch (error) {
    console.error("Public route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/about", async (_req, res) => {
  try {
    const [sections, team, timeline] = await Promise.all([
      prisma.aboutPage.findMany(),
      prisma.aboutTeam.findMany({ orderBy: { sort: "asc" } }),
      prisma.aboutTimeline.findMany({ orderBy: { sort: "asc" } }),
    ]);

    const content = {};
    sections.forEach((s) => { content[s.section] = s.content; });

    res.json({ content, team, timeline });
  } catch (error) {
    console.error("Public route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reviews", async (req, res) => {
  try {
    const { companyId, listingId, page = 1, limit = 10 } = req.query;
    const where = {};
    if (companyId) where.companyId = companyId;
    if (listingId) where.listingId = listingId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          reviewer: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count({ where }),
    ]);
    res.json({ reviews, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Public route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/industries", async (_req, res) => {
  try {
    const items = await prisma.industry.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" } });
    if (items.length > 0) return res.json(items);
    const companies = await prisma.company.findMany({
      where: { status: "active", owner: { role: "franchisor", isActive: true } },
      select: { industry: true },
      distinct: ["industry"],
    });
    const listings = await prisma.franchiseListing.findMany({
      where: { status: "active" },
      select: { industry: true },
      distinct: ["industry"],
    });

    const names = [
      ...new Set([...companies.map((c) => c.industry), ...listings.map((l) => l.industry)]),
    ].sort();
    const fallbackColors = ["#004ac6","#10B981","#8B5CF6","#F59E0B","#EF4444","#EC4899","#06B6D4","#84CC16","#F97316","#6366F1"];
    const items2 = names.map((n, i) => ({
      id: n, name: n, icon: "", image: "", color: fallbackColors[i % fallbackColors.length],
      description: "", displayOrder: i, isActive: true,
    }));
    res.json(items2);
  } catch (error) {
    console.error("Public route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/maintenance", async (_req, res) => {
  res.json({ enabled: await getMaintenanceMode() });
});

router.post("/sales-inquiry", async (req, res) => {
  try {
    const { companyName, fullName, businessEmail, phoneNumber, companySize, message } = req.body;
    if (!companyName || !fullName || !businessEmail) {
      return res.status(400).json({ error: "Company name, full name, and business email are required" });
    }
    const inquiry = await prisma.salesInquiry.create({
      data: { companyName, fullName, businessEmail, phoneNumber, companySize, message },
    });
    res.status(201).json(inquiry);
  } catch (error) {
    console.error("Sales inquiry error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Public CMS endpoints ──

router.get("/blog", async (req, res) => {
  try {
    const { page = 1, limit = 12, category } = req.query;
    const where = { status: "published" };
    if (category) where.category = category;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { publishDate: "desc" },
        select: { id: true, title: true, slug: true, featuredImage: true, author: true, category: true, shortDescription: true, publishDate: true, readingTime: true, isFeatured: true },
      }),
      prisma.blogPost.count({ where }),
    ]);
    res.json({ items, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/blog/:slug", async (req, res) => {
  try {
    const item = await prisma.blogPost.findUnique({ where: { slug: req.params.slug } });
    if (!item || item.status !== "published") return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/careers", async (req, res) => {
  try {
    const { department } = req.query;
    const where = { status: "published" };
    if (department) where.department = department;
    const items = await prisma.career.findMany({
      where, orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events", async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const items = await prisma.event.findMany({
      where, orderBy: { date: "asc" },
    });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/partners", async (req, res) => {
  try {
    const items = await prisma.partner.findMany({
      where: { status: "published" },
      orderBy: { displayOrder: "asc" },
    });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/testimonials", async (req, res) => {
  try {
    const items = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/faq", async (req, res) => {
  try {
    const items = await prisma.siteFAQ.findMany({
      orderBy: { displayOrder: "asc" },
    });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/plans", async (req, res) => {
  try {
    const items = await prisma.plan.findMany({
      where: { status: "published" },
      orderBy: { displayOrder: "asc" },
    });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/statistics", async (req, res) => {
  try {
    const items = await prisma.siteStat.findMany({
      orderBy: { sort: "asc" },
    });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/settings", async (req, res) => {
  try {
    const settings = await prisma.siteSetting.findMany();
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/site-content", async (req, res) => {
  try {
    const [stats, testimonials, partners, faqs, plans, blogPosts] = await Promise.all([
      prisma.siteStat.findMany({ orderBy: { sort: "asc" } }),
      prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.partner.findMany({ where: { status: "published" }, orderBy: { displayOrder: "asc" } }),
      prisma.siteFAQ.findMany({ orderBy: { displayOrder: "asc" } }),
      prisma.plan.findMany({ where: { status: "published" }, orderBy: { displayOrder: "asc" } }),
      prisma.blogPost.findMany({ where: { status: "published", isFeatured: true }, orderBy: { publishDate: "desc" }, take: 6 }),
    ]);

    const contact = await prisma.siteContact.findFirst();
    const settings = await prisma.siteSetting.findMany();
    const settingsMap = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });

    res.json({
      stats,
      testimonials,
      partners,
      faqs,
      plans,
      blogPosts,
      contact,
      settings: settingsMap,
    });
  } catch (error) {
    console.error("Site content error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/locations", async (_req, res) => {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: "locations" } });
    if (setting?.value) return res.json(setting.value);
  } catch (_) {}
  const locations = {
    "India": {
      "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kakinada", "Kadapa", "Anantapur", "Eluru", "Ongole", "Machilipatnam", "Tenali", "Proddatur", "Chittoor", "Hindupur"],
      "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Bomdila", "Ziro", "Aalo", "Tezu", "Namsai", "Roing"],
      "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Barpeta", "Goalpara", "Hailakandi", "Karimganj", "Dhubri", "Kokrajhar", "Sivasagar", "Mangaldoi"],
      "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar", "Munger", "Chhapra", "Sasaram", "Saharsa", "Hajipur", "Bettiah", "Motihari", "Samastipur", "Madhubani", "Kishanganj"],
      "Chandigarh": ["Chandigarh"],
      "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Raigarh", "Jagdalpur", "Ambikapur", "Mahasamund", "Dhamtari", "Kanker"],
      "Delhi": ["New Delhi", "Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh", "Lajpat Nagar", "Connaught Place", "Hauz Khas", "Pitampura", "Janakpuri", "Greater Kailash", "Malviya Nagar", "Green Park", "South Extension"],
      "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Sanquelim", "Valpoi", "Canacona"],
      "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Nadiad", "Morbi", "Bharuch", "Mehsana", "Bhuj", "Navsari", "Valsad", "Palanpur", "Porbandar", "Gandhidham", "Surendranagar"],
      "Haryana": ["Chandigarh", "Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula", "Bhiwani", "Sirsa", "Bahadurgarh", "Jind", "Rewari", "Kaithal", "Palwal", "Narnaul", "Kurukshetra"],
      "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu", "Manali", "Hamirpur", "Bilaspur", "Palampur", "Nahan", "Kangra", "Sundarnagar", "Chamba", "Dalhousie"],
      "Jammu & Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore", "Kathua", "Pulwama", "Udhampur", "Rajouri", "Poonch", "Kupwara", "Budgam", "Bandipora", "Ganderbal", "Kargil", "Leh"],
      "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh", "Dumka", "Phusro", "Medininagar", "Chirkunda", "Chaibasa", "Sahibganj", "Pakur", "Garhwa"],
      "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belagavi", "Davangere", "Bellary", "Gulbarga", "Shimoga", "Tumkur", "Udupi", "Hospet", "Hassan", "Raichur", "Bidar", "Robertsonpet", "Gadag", "Chitradurga", "Kolar", "Mandya"],
      "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Kannur", "Kottayam", "Malappuram", "Kasaragod", "Pathanamthitta", "Idukki", "Wayanad", "Munnar", "Varkala", "Guruvayur", "Chalakudy", "Kalamassery", "Cherthala"],
      "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Dewas", "Ratlam", "Rewa", "Murwara", "Burhanpur", "Khandwa", "Satna", "Morena", "Bhind", "Shivpuri", "Damoh", "Mandsaur", "Chhindwara", "Guna"],
      "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Malegaon", "Nanded", "Sangli", "Jalgaon", "Akola", "Latur", "Ahmednagar", "Dhule", "Chandrapur", "Parbhani", "Ichalkaranji"],
      "Manipur": ["Imphal", "Bishnupur", "Thoubal", "Churachandpur", "Senapati", "Ukhrul", "Kakching", "Mayang Imphal", "Jiribam", "Tamenglong"],
      "Meghalaya": ["Shillong", "Tura", "Nongstoin", "Jowai", "Williamnagar", "Baghmara", "Resubelpara", "Mairang", "Nongpoh", "Amlarem"],
      "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Lawngtlai", "Saiha", "Mamit", "Khawzawl", "Saitual"],
      "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Phek", "Mon", "Longleng", "Kiphire"],
      "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda", "Jeypore", "Barbil", "Angul", "Dhenkanal", "Kendujhar", "Paradip", "Bargarh", "Brahmapur", "Rayagada", "Talcher"],
      "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
      "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur", "Batala", "Moga", "Abohar", "Malerkotla", "Phagwara", "Barnala", "Firozpur", "Kapurthala", "Nawanshahr", "Fazilka", "Tarn Taran"],
      "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Bharatpur", "Sikar", "Pali", "Sri Ganganagar", "Tonk", "Kishangarh", "Beawar", "Churu", "Nagaur", "Sawai Madhopur", "Hanumangarh", "Dholpur"],
      "Sikkim": ["Gangtok", "Namchi", "Mangan", "Gyalshing", "Rangpo", "Singtam", "Jorethang", "Rhenock", "Pakyong", "Soreng"],
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Dindigul", "Thanjavur", "Ranipet", "Sivakasi", "Karur", "Udhagamandalam", "Hosur", "Nagercoil", "Kanchipuram", "Kumbakonam", "Cuddalore", "Rajapalayam", "Pollachi", "Ambur", "Nagapattinam"],
      "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet", "Siddipet", "Miryalaguda", "Jagtial", "Mancherial", "Vikarabad", "Zaheerabad", "Bhadrachalam", "Medak", "Bhongir", "Wanaparthy"],
      "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia", "Khowai", "Ambassa", "Teliamura", "Kumarghat", "Bishalgarh"],
      "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Ghaziabad", "Noida", "Meerut", "Bareilly", "Aligarh", "Moradabad", "Gorakhpur", "Saharanpur", "Jhansi", "Firozabad", "Mathura", "Muzaffarnagar", "Shahjahanpur", "Rampur", "Ayodhya", "Sultanpur", "Etawah", "Loni", "Hapur", "Bulandshahr", "Sambhal", "Amroha", "Bahraich", "Unnao", "Rae Bareli"],
      "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Roorkee", "Rudrapur", "Kashipur", "Nainital", "Mussoorie", "Kotdwar", "Pithoragarh", "Almora", "Ramnagar", "Kichha", "Sitarganj", "Khatima", "Bageshwar", "Champawat", "Tehri", "Pauri"],
      "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Kharagpur", "Haldia", "Krishnanagar", "Balurghat", "Jalpaiguri", "Baharampur", "Darjeeling", "Habra", "Basirhat", "Cooch Behar", "Raiganj", "Medinipur", "Tamluk", "Bangaon", "Contai", "Ranaghat", "Rishra", "English Bazar"],
    },
  };
  res.json(locations);
});

router.get("/media", async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const where = {};
    if (type) where.type = type;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      prisma.media.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: "desc" } }),
      prisma.media.count({ where }),
    ]);
    res.json({ items, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/featured-companies", async (_req, res) => {
  try {
    const companies = await prisma.company.findMany({
      where: { status: "active", owner: { role: "franchisor", isActive: true } },
      take: 8,
      include: { _count: { select: { followers: true, listings: true } } },
      orderBy: [{ isVerified: "desc" }, { followerCount: "desc" }],
    });
    res.json(companies);
  } catch (error) {
    console.error("Featured companies error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/featured-listings", async (_req, res) => {
  try {
    const listings = await prisma.franchiseListing.findMany({
      where: { status: "active", isFeatured: true },
      take: 6,
      include: {
        company: { select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true } },
        _count: { select: { applications: true } },
      },
      orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
    });
    res.json(listings);
  } catch (error) {
    console.error("Featured listings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/newsletter", async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const existing = await prisma.newsletterSubscription.findUnique({ where: { email } });
    if (existing) return res.json({ message: "Already subscribed" });
    const sub = await prisma.newsletterSubscription.create({ data: { email, name } });
    res.status(201).json(sub);
  } catch (error) {
    if (error.code === "P2002") return res.json({ message: "Already subscribed" });
    console.error("Newsletter error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/hero-slides", async (_req, res) => {
  try {
    const items = await prisma.heroSlide.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/featured-cities", async (_req, res) => {
  try {
    const featured = await prisma.featuredCity.findMany({ orderBy: { displayOrder: "asc" } });
    if (featured.length > 0) {
      const allListings = await prisma.franchiseListing.findMany({
        where: { status: "active" },
        select: { city: true },
      });
      const countMap = {};
      allListings.forEach((l) => { if (l.city) countMap[l.city] = (countMap[l.city] || 0) + 1; });
      const items = featured.map((c) => ({
        id: c.id, name: c.name, state: c.state, image: c.image,
        isFeatured: c.isFeatured, displayOrder: c.displayOrder,
        listingCount: countMap[c.name] || c.listingCount || 0,
      }));
      return res.json({ items });
    }
    const listings = await prisma.franchiseListing.findMany({
      where: { status: "active", city: { not: null } },
      select: { city: true, state: true },
    });
    const cityMap = new Map();
    listings.forEach(l => {
      const key = `${l.city}|${l.state || ''}`;
      if (cityMap.has(key)) {
        cityMap.get(key).listingCount++;
      } else {
        cityMap.set(key, { name: l.city, state: l.state || '', listingCount: 1 });
      }
    });
    const items = Array.from(cityMap.values())
      .sort((a, b) => b.listingCount - a.listingCount)
      .slice(0, 20);
    res.json({ items });
  } catch (error) {
    console.error("Featured cities error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/navigation", async (_req, res) => {
  try {
    const items = await prisma.navigationLink.findMany({ where: { isVisible: true }, orderBy: { sortOrder: "asc" } });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/pages/:slug", async (req, res) => {
  try {
    const page = await prisma.contentPage.findUnique({ where: { slug: req.params.slug } });
    if (!page || page.status !== "published") return res.status(404).json({ error: "Not found" });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Hero Settings
router.get("/hero", async (_req, res) => {
  try {
    const hero = await prisma.heroSetting.findFirst({ where: { status: "published", isActive: true } });
    res.json(hero || {});
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Industries (landing page)
router.get("/industries-list", async (_req, res) => {
  try {
    const items = await prisma.industry.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" } });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// AI Section
router.get("/ai-section", async (_req, res) => {
  try {
    const section = await prisma.aISection.findFirst({ where: { isActive: true } });
    res.json(section || {});
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Global Network
router.get("/global-network", async (_req, res) => {
  try {
    const network = await prisma.globalNetwork.findFirst({ where: { isActive: true } });
    res.json(network || {});
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Map Locations
router.get("/map-location", async (_req, res) => {
  try {
    const map = await prisma.mapLocation.findFirst({ where: { isActive: true } });
    res.json(map || {});
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Global Metrics
router.get("/global-metrics", async (_req, res) => {
  try {
    const items = await prisma.globalMetric.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" } });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Newsletter Settings
router.get("/newsletter-settings", async (_req, res) => {
  try {
    const settings = await prisma.newsletterSetting.findFirst({ where: { isActive: true } });
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Footer Settings
router.get("/footer", async (_req, res) => {
  try {
    const footer = await prisma.footerSetting.findFirst({ where: { isActive: true } });
    res.json(footer || {});
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Marketplace Search
router.get("/marketplace-search", async (_req, res) => {
  try {
    const search = await prisma.marketplaceSearchSetting.findFirst({ where: { isActive: true } });
    res.json(search || {});
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// User Types
router.get("/user-types", async (_req, res) => {
  try {
    const items = await prisma.userType.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Features
router.get("/features", async (_req, res) => {
  try {
    const items = await prisma.feature.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// How It Works
router.get("/how-it-works", async (_req, res) => {
  try {
    const items = await prisma.howItWork.findMany({ where: { isPublished: true }, orderBy: { stepNumber: "asc" } });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Public Master Data ──

const PUBLIC_MASTER_DATA = {
  "business-types": { prisma: () => prisma.businessType, orderBy: { displayOrder: "asc" } },
  "opportunity-types": { prisma: () => prisma.opportunityType, orderBy: { displayOrder: "asc" } },
  "company-sizes": { prisma: () => prisma.companySize, orderBy: { displayOrder: "asc" } },
  languages: { prisma: () => prisma.language, orderBy: { displayOrder: "asc" } },
  currencies: { prisma: () => prisma.currency, orderBy: { displayOrder: "asc" } },
  "document-types": { prisma: () => prisma.documentType, orderBy: { displayOrder: "asc" } },
  "investment-ranges": { prisma: () => prisma.investmentRange, orderBy: { displayOrder: "asc" } },
};

Object.entries(PUBLIC_MASTER_DATA).forEach(([route, config]) => {
  router.get(`/${route}`, async (_req, res) => {
    try {
      const items = await config.prisma().findMany({ where: { isActive: true }, orderBy: config.orderBy });
      res.json({ items });
    } catch (error) {
      console.error("Public route error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

export default router;
