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

  // ── Site Contact ──

  await prisma.siteContact.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      email: "hello@franchisia.com",
      phone: "+91-1800-123-4567",
      address: "Mumbai, Maharashtra, India",
    },
  });

  // ── Site Stats ──

  const stats = [
    { value: "50,000+", label: "Registered Professionals", sort: 1 },
    { value: "10,000+", label: "Active Franchise Listings", sort: 2 },
    { value: "2,500+", label: "Verified Franchisors", sort: 3 },
    { value: "15,000+", label: "Successful Matches", sort: 4 },
    { value: "$25B+", label: "Investment Facilitated", sort: 5 },
    { value: "98%", label: "Satisfaction Rate", sort: 6 },
  ];

  for (const stat of stats) {
    await prisma.siteStat.create({ data: stat });
  }

  // ── Hero Slides (existing model) ──

  await prisma.heroSlide.upsert({
    where: { id: "hero-slide-001" },
    update: {},
    create: {
      id: "hero-slide-001",
      title: "Find the Perfect Franchise Opportunity",
      subtitle: "India's premier professional network for the franchise ecosystem. Discover verified opportunities, connect with industry leaders, and grow your business.",
      quote: "Connecting Entrepreneurs with Franchise Opportunities\nYour Gateway to Franchise Success\nEmpowering Business Growth Across India",
      ctaText: "Explore Marketplace",
      ctaUrl: "/discover",
      secondaryCtaText: "Register Your Business",
      secondaryCtaUrl: "/signup",
      isActive: true,
      sortOrder: 0,
    },
  });

  // ── Hero Setting (new consolidated model) ──

  await prisma.heroSetting.upsert({
    where: { id: "hero-setting-001" },
    update: {},
    create: {
      id: "hero-setting-001",
      title: "Find the Perfect Franchise Opportunity",
      subtitle: "Connecting Entrepreneurs with Franchise Opportunities",
      description: "India's premier professional network for the franchise ecosystem. Discover verified opportunities, connect with industry leaders, and grow your business.",
      primaryButtonText: "Explore Marketplace",
      primaryButtonUrl: "/discover",
      secondaryButtonText: "Register Your Business",
      secondaryButtonUrl: "/signup",
      isActive: true,
      status: "published",
    },
  });

  // ── User Types ──

  const userTypes = [
    { title: "Franchisor", description: "Grow your brand and recruit qualified franchise partners across India.", icon: "Store", buttonText: "Learn More", buttonUrl: "/signup", sortOrder: 1 },
    { title: "Franchisee", description: "Discover trusted franchise opportunities that match your goals and investment.", icon: "Users", buttonText: "Learn More", buttonUrl: "/signup", sortOrder: 2 },
    { title: "Investor", description: "Find businesses with strong growth potential and high returns.", icon: "TrendingUp", buttonText: "Learn More", buttonUrl: "/signup", sortOrder: 3 },
    { title: "Consultant", description: "Guide brands toward successful expansion and market dominance.", icon: "Briefcase", buttonText: "Learn More", buttonUrl: "/signup", sortOrder: 4 },
    { title: "Supplier", description: "Connect with franchise businesses that need your products and services.", icon: "Package", buttonText: "Learn More", buttonUrl: "/signup", sortOrder: 5 },
  ];

  for (const ut of userTypes) {
    await prisma.userType.create({ data: ut });
  }

  // ── Features ──

  const features = [
    { icon: "ShieldCheck", title: "Verified Companies", description: "Every company is verified before joining the platform.", category: "trust", sortOrder: 1 },
    { icon: "MessageSquareShare", title: "Secure Messaging", description: "Communicate directly with trusted professionals in real-time.", category: "communication", sortOrder: 2 },
    { icon: "Store", title: "Marketplace", description: "Thousands of franchise opportunities across industries and locations.", category: "discovery", sortOrder: 3 },
    { icon: "Network", title: "Professional Networking", description: "Build meaningful business relationships with industry leaders.", category: "networking", sortOrder: 4 },
    { icon: "BarChart3", title: "Analytics", description: "Track engagement, applications, and performance metrics.", category: "analytics", sortOrder: 5 },
    { icon: "Calculator", title: "Investment Calculator", description: "Estimate ROI and compare investment options before committing.", category: "tools", sortOrder: 6 },
    { icon: "Star", title: "Reviews & Ratings", description: "Read verified experiences from real franchise professionals.", category: "trust", sortOrder: 7 },
    { icon: "BrainCircuit", title: "AI Matching", description: "Smart recommendations powered by artificial intelligence.", category: "ai", sortOrder: 8 },
  ];

  for (const f of features) {
    await prisma.feature.create({ data: f });
  }

  // ── How It Works ──

  const howItWorks = [
    { stepNumber: 1, title: "Create Your Account", description: "Sign up and join India's fastest-growing franchise ecosystem.", icon: "UserPlus" },
    { stepNumber: 2, title: "Build Your Profile", description: "Showcase your experience, preferences, and investment capacity.", icon: "FileText" },
    { stepNumber: 3, title: "Discover Opportunities", description: "Browse and compare franchise opportunities across industries and locations.", icon: "Search" },
    { stepNumber: 4, title: "Connect with Professionals", description: "Network with franchisors, investors, consultants, and peers.", icon: "MessageSquareText" },
    { stepNumber: 5, title: "Apply or Recruit", description: "Submit applications or review candidates directly on the platform.", icon: "FileCheck" },
    { stepNumber: 6, title: "Grow Together", description: "Build lasting relationships and scale your franchise journey.", icon: "TrendingUp" },
  ];

  for (const step of howItWorks) {
    await prisma.howItWork.create({ data: step });
  }

  // ── Industries ──

  const industries = [
    { name: "Food & Beverage", icon: "UtensilsCrossed", color: "#ef4444", description: "Restaurants, cafes, cloud kitchens, and food franchises.", displayOrder: 1 },
    { name: "Retail", icon: "ShoppingBag", color: "#f59e0b", description: "Stores, boutiques, supermarkets, and retail chains.", displayOrder: 2 },
    { name: "Healthcare", icon: "HeartPulse", color: "#22c55e", description: "Clinics, diagnostic centers, pharmacies, and wellness.", displayOrder: 3 },
    { name: "Education", icon: "GraduationCap", color: "#3b82f6", description: "Tutoring centers, training institutes, and schools.", displayOrder: 4 },
    { name: "Technology", icon: "Cpu", color: "#8b5cf6", description: "IT services, software, and tech support franchises.", displayOrder: 5 },
    { name: "Automotive", icon: "Car", color: "#06b6d4", description: "Car repair, service centers, and auto dealerships.", displayOrder: 6 },
    { name: "Beauty", icon: "Sparkles", color: "#ec4899", description: "Salons, spas, beauty clinics, and grooming services.", displayOrder: 7 },
    { name: "Hospitality", icon: "Hotel", color: "#14b8a6", description: "Hotels, resorts, homestays, and travel services.", displayOrder: 8 },
    { name: "Logistics", icon: "Truck", color: "#f97316", description: "Courier, warehousing, supply chain, and delivery.", displayOrder: 9 },
    { name: "Real Estate", icon: "Building2", color: "#6366f1", description: "Property brokerage, rental management, and development.", displayOrder: 10 },
  ];

  for (const ind of industries) {
    await prisma.industry.create({ data: ind });
  }

  // ── Featured Cities ──

  const cities = [
    { name: "Chennai", state: "Tamil Nadu", isFeatured: true, displayOrder: 1, listingCount: 0 },
    { name: "Bengaluru", state: "Karnataka", isFeatured: true, displayOrder: 2, listingCount: 0 },
    { name: "Mumbai", state: "Maharashtra", isFeatured: true, displayOrder: 3, listingCount: 0 },
    { name: "Delhi", state: "Delhi", isFeatured: true, displayOrder: 4, listingCount: 0 },
    { name: "Hyderabad", state: "Telangana", isFeatured: true, displayOrder: 5, listingCount: 0 },
    { name: "Pune", state: "Maharashtra", isFeatured: true, displayOrder: 6, listingCount: 0 },
    { name: "Ahmedabad", state: "Gujarat", isFeatured: true, displayOrder: 7, listingCount: 0 },
    { name: "Coimbatore", state: "Tamil Nadu", isFeatured: true, displayOrder: 8, listingCount: 0 },
  ];

  for (const city of cities) {
    await prisma.featuredCity.create({ data: city });
  }

  // ── AI Section ──

  await prisma.aISection.upsert({
    where: { id: "ai-section-001" },
    update: {},
    create: {
      id: "ai-section-001",
      title: "AI-Powered Franchise Matching",
      subtitle: "Receive personalized recommendations based on your interests and investment goals.",
      description: "Our AI analyzes your profile to find the best franchise opportunities that match your preferences, budget, and location.",
      features: [
        { title: "Smart Matching", description: "AI analyzes your profile to find the best franchise fit" },
        { title: "Predictive Insights", description: "Data-driven projections for growth potential and ROI" },
        { title: "Personalized Alerts", description: "Get notified when opportunities match your criteria" },
      ],
      buttonText: "Notify Me When Available",
      buttonUrl: "#newsletter",
      isActive: true,
    },
  });

  // ── Global Network ──

  await prisma.globalNetwork.upsert({
    where: { id: "global-network-001" },
    update: {},
    create: {
      id: "global-network-001",
      title: "Connected Across India",
      subtitle: "Building a professional franchise network that spans every major business hub in the country.",
      description: "India's premier franchise network connecting professionals nationwide with opportunities, resources, and expertise.",
      isActive: true,
    },
  });

  // ── Map Location ──

  await prisma.mapLocation.upsert({
    where: { id: "map-location-001" },
    update: {},
    create: {
      id: "map-location-001",
      title: "Discover Opportunities Near You",
      subtitle: "Explore nearby branches, expansion territories and franchise opportunities across India.",
      enableMap: true,
      enableNearbyBranches: true,
      enableTerritories: true,
      defaultLat: 20.5937,
      defaultLng: 78.9629,
      defaultZoom: 5,
      isActive: true,
    },
  });

  // ── Global Metrics ──

  const metrics = [
    { label: "Professionals", value: "50K+", icon: "Users", displayOrder: 1 },
    { label: "Companies", value: "2.5K+", icon: "Building2", displayOrder: 2 },
    { label: "Listings", value: "10K+", icon: "Briefcase", displayOrder: 3 },
    { label: "Cities", value: "100+", icon: "MapPin", displayOrder: 4 },
  ];

  for (const m of metrics) {
    await prisma.globalMetric.create({ data: m });
  }

  // ── Newsletter Setting ──

  await prisma.newsletterSetting.upsert({
    where: { id: "newsletter-setting-001" },
    update: {},
    create: {
      id: "newsletter-setting-001",
      title: "Stay Updated",
      subtitle: "Get franchise opportunities and industry insights delivered directly to your inbox.",
      successMessage: "You're subscribed! Stay tuned for franchise insights and opportunities.",
      buttonText: "Subscribe",
      placeholder: "Enter your email",
      isActive: true,
    },
  });

  // ── Marketplace Search Setting ──

  await prisma.marketplaceSearchSetting.upsert({
    where: { id: "marketplace-search-001" },
    update: {},
    create: {
      id: "marketplace-search-001",
      title: "Find Your Next Franchise Opportunity",
      description: "Browse thousands of franchise opportunities. Filter by industry, location, investment range, and business category.",
      defaultIndustries: [
        "Food & Beverage", "Retail", "Healthcare", "Education",
        "Technology", "Automotive", "Beauty", "Hospitality",
        "Logistics", "Real Estate",
      ],
      defaultLocations: [
        "All Locations", "Mumbai", "Delhi", "Bengaluru", "Chennai",
        "Hyderabad", "Pune", "Ahmedabad", "Kolkata", "Jaipur",
        "Lucknow", "Chandigarh", "Indore", "Bhopal", "Surat",
      ],
      investmentRanges: [
        "Under ₹5L",
        "₹5L - ₹10L",
        "₹10L - ₹25L",
        "₹25L - ₹50L",
        "₹50L - ₹1Cr",
        "₹1Cr - ₹5Cr",
        "₹5Cr+",
      ],
      placeholder: "Search franchises...",
      searchButtonText: "Search Marketplace",
      isActive: true,
    },
  });

  // ── Footer Setting ──

  await prisma.footerSetting.upsert({
    where: { id: "footer-setting-001" },
    update: {},
    create: {
      id: "footer-setting-001",
      copyright: `© ${new Date().getFullYear()} Franchisia. All Rights Reserved.`,
      aboutText: "India's professional network for the franchise ecosystem. Connect, discover, and grow with verified franchisors, franchisees, investors, consultants, and suppliers.",
      email: "hello@franchisia.com",
      phone: "+91-1800-123-4567",
      address: "Mumbai, Maharashtra, India",
      quickLinks: [
        {
          heading: "Quick Links",
          links: [
            { label: "Home", to: "/" },
            { label: "Discover", to: "/discover" },
            { label: "Companies", to: "/companies" },
            { label: "Pricing", to: "/#pricing" },
            { label: "About Us", to: "/about" },
            { label: "Blog", to: "/blog" },
          ],
        },
        {
          heading: "For Franchisors",
          links: [
            { label: "List Your Franchise", to: "/dashboard/listings" },
            { label: "Franchisor Resources", to: "/resources" },
            { label: "Success Stories", to: "/#testimonials" },
            { label: "Pricing Plans", to: "/#pricing" },
          ],
        },
        {
          heading: "For Investors",
          links: [
            { label: "Browse Opportunities", to: "/discover" },
            { label: "Investment Calculator", to: "/tools/investment-calculator" },
            { label: "Due Diligence Guide", to: "/guides/due-diligence" },
            { label: "Compare Options", to: "/discover" },
          ],
        },
        {
          heading: "Support",
          links: [
            { label: "Help Center", to: "/help" },
            { label: "FAQ", to: "/#faq" },
            { label: "Contact Us", to: "/#contact" },
            { label: "Privacy Policy", to: "/privacy" },
            { label: "Terms of Service", to: "/terms" },
          ],
        },
      ],
      socialLinks: [
        { label: "LinkedIn", url: "https://linkedin.com/company/franchisia", href: "https://linkedin.com/company/franchisia" },
        { label: "Twitter", url: "https://twitter.com/franchisia", href: "https://twitter.com/franchisia" },
        { label: "Facebook", url: "https://facebook.com/franchisia", href: "https://facebook.com/franchisia" },
        { label: "Instagram", url: "https://instagram.com/franchisia", href: "https://instagram.com/franchisia" },
      ],
      isActive: true,
    },
  });

  // ── Plans (Pricing) ──

  const plans = [
    {
      name: "Starter",
      slug: "starter",
      price: 0,
      interval: "month",
      description: "Perfect for exploring franchise opportunities.",
      features: {
        "Browse Listings": true,
        "Basic Profile": true,
        "Email Support": true,
        "Save Favorites": true,
        "Marketplace Access": true,
        "Investment Calculator": false,
        "AI Recommendations": false,
        "Priority Support": false,
        "Advanced Analytics": false,
      },
      isPopular: false,
      displayOrder: 1,
      status: "published",
    },
    {
      name: "Professional",
      slug: "professional",
      price: 149,
      interval: "month",
      description: "For serious franchise seekers and franchisors.",
      features: {
        "Browse Listings": true,
        "Advanced Profile": true,
        "Priority Email Support": true,
        "Save Favorites": true,
        "Marketplace Access": true,
        "Investment Calculator": true,
        "AI Recommendations": true,
        "Priority Support": true,
        "Advanced Analytics": false,
      },
      isPopular: true,
      displayOrder: 2,
      status: "published",
    },
    {
      name: "Enterprise",
      slug: "enterprise",
      price: 499,
      interval: "month",
      description: "For large-scale franchise operations and networks.",
      features: {
        "Browse Listings": true,
        "Premium Profile": true,
        "24/7 Phone Support": true,
        "Save Favorites": true,
        "Marketplace Access": true,
        "Investment Calculator": true,
        "AI Recommendations": true,
        "Priority Support": true,
        "Advanced Analytics": true,
      },
      isPopular: false,
      displayOrder: 3,
      status: "published",
    },
  ];

  for (const plan of plans) {
    await prisma.plan.create({ data: plan });
  }

  // ── Site FAQ ──

  const faqs = [
    {
      question: "What is Franchisia?",
      answer: "Franchisia is India's premier professional network for the franchise ecosystem. We connect franchisors, franchisees, investors, consultants, and suppliers on a single platform, making it easy to discover opportunities, build relationships, and grow businesses.",
      category: "General",
      displayOrder: 1,
    },
    {
      question: "How do I get started on Franchisia?",
      answer: "Simply create a free account by signing up with your email or Google account. Complete your profile with your preferences and investment capacity, then start browsing thousands of franchise opportunities across industries and locations.",
      category: "Getting Started",
      displayOrder: 2,
    },
    {
      question: "Is Franchisia free to use?",
      answer: "Yes! Basic membership is completely free. You can browse listings, create a profile, and connect with professionals at no cost. Premium plans with advanced features like AI recommendations and detailed analytics are available for serious investors and franchisors.",
      category: "Pricing",
      displayOrder: 3,
    },
    {
      question: "How are companies verified on the platform?",
      answer: "Every company undergoes a thorough verification process including business registration checks, GST verification, and background screening. Verified companies receive a badge on their profile, giving you confidence in your business decisions.",
      category: "Trust & Safety",
      displayOrder: 4,
    },
    {
      question: "Can I communicate with franchisors directly?",
      answer: "Absolutely! Our built-in messaging system allows you to connect directly with franchisors, investors, and other professionals. You can ask questions, schedule meetings, and negotiate terms all within the platform.",
      category: "Communication",
      displayOrder: 5,
    },
    {
      question: "What types of franchises are available?",
      answer: "We feature franchises across 10+ industries including Food & Beverage, Retail, Healthcare, Education, Technology, Automotive, Beauty, Hospitality, Logistics, and Real Estate. Our listings range from small local opportunities to large international brands.",
      category: "Listings",
      displayOrder: 6,
    },
    {
      question: "How does the AI matching work?",
      answer: "Our AI analyzes your profile, preferences, investment capacity, and past interactions to recommend franchise opportunities that best match your criteria. The more you use the platform, the smarter the recommendations become.",
      category: "Features",
      displayOrder: 7,
    },
    {
      question: "Can I apply for franchises through the platform?",
      answer: "Yes! You can submit applications directly through Franchisia. Your profile, experience, and credentials are shared with franchisors, making the application process seamless and efficient.",
      category: "Applications",
      displayOrder: 8,
    },
    {
      question: "What support do you offer for franchisors?",
      answer: "Franchisors get access to analytics, applicant tracking, brand management tools, and AI-powered matching to find the best franchisees. Our platform helps you manage your entire franchise recruitment pipeline.",
      category: "For Franchisors",
      displayOrder: 9,
    },
    {
      question: "Is my data secure on Franchisia?",
      answer: "Yes, we take data security seriously. All communications are encrypted, your personal information is protected, and we never share your data without your consent. We comply with all applicable data protection regulations.",
      category: "Trust & Safety",
      displayOrder: 10,
    },
  ];

  for (const faq of faqs) {
    await prisma.siteFAQ.create({ data: faq });
  }

  // ── Testimonials ──

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Franchisee",
      company: "QuickBite Foods",
      rating: 5,
      review: "Franchisia helped me find the perfect franchise opportunity. The platform made it easy to compare options and connect with franchisors. I'm now running my own QuickBite outlet and couldn't be happier!",
      isFeatured: true,
    },
    {
      name: "Priya Sharma",
      role: "Franchisor",
      company: "EduPro Learning",
      rating: 5,
      review: "As a franchisor, Franchisia has been invaluable for finding quality franchisees. The verification system gives us confidence in applicants, and the analytics help us track our expansion goals.",
      isFeatured: true,
    },
    {
      name: "Amit Verma",
      role: "Investor",
      company: "Ventura Capital",
      rating: 4,
      review: "The investment calculator and AI recommendations have transformed how I evaluate franchise opportunities. Franchisia provides the data I need to make informed investment decisions.",
      isFeatured: true,
    },
    {
      name: "Ananya Patel",
      role: "Consultant",
      company: "GrowthBridge Consulting",
      rating: 5,
      review: "Franchisia streamlines the entire franchise consulting process. I can connect my clients with verified opportunities and track their progress through the platform. An essential tool for any consultant.",
      isFeatured: false,
    },
    {
      name: "Vikram Singh",
      role: "Franchisee",
      company: "FitLife Gym",
      rating: 5,
      review: "From discovery to application, Franchisia made everything simple. I found a gym franchise that matched my budget and location preferences. The support team was also very helpful throughout the process.",
      isFeatured: false,
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  // ── Blog Posts ──

  const blogPosts = [
    {
      title: "Top 10 Franchise Opportunities in India for 2025",
      slug: "top-10-franchise-opportunities-india-2025",
      author: "Franchisia Team",
      category: "Market Insights",
      tags: ["franchise", "opportunities", "India", "2025", "investment"],
      shortDescription: "Discover the most promising franchise opportunities across India's booming industries, from food and retail to education and healthcare.",
      content: "India's franchise market is experiencing unprecedented growth. Here are the top 10 franchise opportunities that are shaping the future of Indian entrepreneurship...",
      status: "published",
      isFeatured: true,
      publishDate: new Date("2025-06-15"),
      readingTime: 8,
    },
    {
      title: "How to Choose the Right Franchise: A Complete Guide",
      slug: "how-to-choose-right-franchise-guide",
      author: "Priya Sharma",
      category: "Franchise Tips",
      tags: ["guide", "franchise", "selection", "due diligence"],
      shortDescription: "A step-by-step guide to evaluating franchise opportunities and making an informed decision that aligns with your goals.",
      content: "Choosing the right franchise is one of the most important business decisions you'll make. This comprehensive guide walks you through every step of the evaluation process...",
      status: "published",
      isFeatured: true,
      publishDate: new Date("2025-05-28"),
      readingTime: 12,
    },
    {
      title: "The Rise of Food Franchises in Tier 2 Cities",
      slug: "rise-food-franchises-tier-2-cities",
      author: "Amit Verma",
      category: "Industry Trends",
      tags: ["food", "franchise", "tier 2", "expansion", "growth"],
      shortDescription: "Why smart investors are looking beyond metro cities for food franchise opportunities and finding gold in India's emerging markets.",
      content: "While metros continue to dominate the franchise landscape, tier 2 cities are emerging as the new growth frontiers for food franchises...",
      status: "published",
      isFeatured: false,
      publishDate: new Date("2025-05-10"),
      readingTime: 6,
    },
    {
      title: "Franchise vs Independent Business: What's Right for You?",
      slug: "franchise-vs-independent-business",
      author: "Franchisia Team",
      category: "Business Advice",
      tags: ["franchise", "independent", "comparison", "entrepreneurship"],
      shortDescription: "Compare the pros and cons of buying a franchise versus starting your own business from scratch.",
      content: "One of the biggest decisions entrepreneurs face is whether to buy a franchise or start an independent business. Both paths offer unique advantages...",
      status: "published",
      isFeatured: false,
      publishDate: new Date("2025-04-22"),
      readingTime: 10,
    },
    {
      title: "Understanding Franchise Fees and Royalties",
      slug: "understanding-franchise-fees-royalties",
      author: "Rajesh Kumar",
      category: "Financial Planning",
      tags: ["fees", "royalties", "franchise", "costs", "financial"],
      shortDescription: "A breakdown of the various fees involved in franchising and how to budget for them effectively.",
      content: "Franchise fees and royalties can be confusing for first-time franchisees. This article breaks down the different types of fees you can expect...",
      status: "published",
      isFeatured: false,
      publishDate: new Date("2025-04-05"),
      readingTime: 7,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.create({ data: post });
  }

  // ── Events ──

  const events = [
    {
      title: "Franchise Expo Mumbai 2025",
      description: "India's largest franchise exhibition featuring 200+ brands, networking sessions, and expert seminars.",
      venue: "Mumbai Convention Centre",
      address: "BKC, Mumbai, Maharashtra",
      date: new Date("2025-09-15"),
      time: "10:00 AM - 6:00 PM",
      organizer: "Franchisia Events",
      registrationLink: "https://example.com/franchise-expo-mumbai",
      maxParticipants: 5000,
      status: "upcoming",
    },
    {
      title: "Franchise Webinar: Digital Transformation in Franchising",
      description: "Learn how technology is reshaping the franchise industry and how to leverage digital tools for growth.",
      venue: "Online (Zoom)",
      date: new Date("2025-08-20"),
      time: "3:00 PM - 4:30 PM",
      organizer: "Franchisia",
      registrationLink: "https://example.com/webinar-digital-franchise",
      maxParticipants: 500,
      status: "upcoming",
    },
    {
      title: "Franchisor-Franchisee Networking Meetup",
      description: "An exclusive networking event for franchisors and qualified franchisees to connect and explore partnerships.",
      venue: "The Lalit Hotel",
      address: "New Delhi, India",
      date: new Date("2025-07-10"),
      time: "6:00 PM - 9:00 PM",
      organizer: "Franchisia",
      maxParticipants: 200,
      status: "upcoming",
    },
  ];

  for (const event of events) {
    await prisma.event.create({ data: event });
  }

  // ── Careers ──

  const careers = [
    {
      jobTitle: "Senior Full Stack Developer",
      department: "Engineering",
      location: "Mumbai (Hybrid)",
      employmentType: "Full-time",
      experience: "3-5 years",
      salary: "₹20L - ₹35L",
      description: "Build and maintain the franchise platform that powers India's franchise ecosystem.",
      responsibilities: "Design and implement scalable features, collaborate with product team, mentor junior developers.",
      requirements: "Proficiency in React, Node.js, PostgreSQL. Experience with real-time applications and cloud services.",
      benefits: "Competitive salary, equity options, health insurance, flexible hours, learning budget.",
      applyLink: "https://example.com/careers/senior-fullstack",
      status: "published",
    },
    {
      jobTitle: "Growth Marketing Manager",
      department: "Marketing",
      location: "Mumbai",
      employmentType: "Full-time",
      experience: "4-6 years",
      salary: "₹15L - ₹25L",
      description: "Drive user acquisition and engagement for India's fastest-growing franchise network.",
      responsibilities: "Develop growth strategies, manage campaigns, analyze metrics, optimize conversion funnels.",
      requirements: "Experience in B2B marketing, SEO/SEM, content marketing, and analytics tools.",
      benefits: "Competitive salary, performance bonuses, health coverage, remote-friendly.",
      applyLink: "https://example.com/careers/growth-marketing",
      status: "published",
    },
    {
      jobTitle: "Customer Success Manager",
      department: "Operations",
      location: "Mumbai",
      employmentType: "Full-time",
      experience: "2-4 years",
      salary: "₹10L - ₹18L",
      description: "Help franchisors and franchisees achieve their goals on the Franchisia platform.",
      responsibilities: "Onboard new users, provide support, gather feedback, improve user experience.",
      requirements: "Excellent communication skills, problem-solving ability, experience in SaaS or marketplace.",
      benefits: "Competitive salary, health insurance, ESOP, professional development.",
      applyLink: "https://example.com/careers/customer-success",
      status: "published",
    },
  ];

  for (const career of careers) {
    await prisma.career.create({ data: career });
  }

  // ── Partners ──

  const partners = [
    {
      name: "Google Cloud",
      partnerType: "Technology Partner",
      description: "Powering Franchisia's infrastructure with scalable cloud solutions.",
      website: "https://cloud.google.com",
      isFeatured: true,
      displayOrder: 1,
      status: "published",
    },
    {
      name: "Stripe",
      partnerType: "Payment Partner",
      description: "Secure payment processing for franchise transactions.",
      website: "https://stripe.com",
      isFeatured: true,
      displayOrder: 2,
      status: "published",
    },
    {
      name: "AWS",
      partnerType: "Technology Partner",
      description: "Cloud infrastructure and AI/ML services.",
      website: "https://aws.amazon.com",
      isFeatured: true,
      displayOrder: 3,
      status: "published",
    },
    {
      name: "Zoho",
      partnerType: "Business Tools Partner",
      description: "Integrated CRM and business productivity tools.",
      website: "https://zoho.com",
      isFeatured: false,
      displayOrder: 4,
      status: "published",
    },
    {
      name: "Freshworks",
      partnerType: "Customer Support Partner",
      description: "Customer engagement and support solutions.",
      website: "https://freshworks.com",
      isFeatured: false,
      displayOrder: 5,
      status: "published",
    },
    {
      name: "Razorpay",
      partnerType: "Payment Partner",
      description: "Indian payment gateway for seamless transactions.",
      website: "https://razorpay.com",
      isFeatured: true,
      displayOrder: 6,
      status: "published",
    },
  ];

  for (const partner of partners) {
    await prisma.partner.create({ data: partner });
  }

  // ── About Pages ──

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

  // ── About Team ──

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

  // ── About Timeline ──

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

  // ── Site Settings (Section Content) ──

  const sectionContent = [
    { key: "section_featured_companies_heading", value: { text: "Featured Franchise Brands" } },
    { key: "section_featured_companies_description", value: { text: "Top-rated franchisors actively looking for partners." } },
    { key: "section_featured_listings_heading", value: { text: "Featured Opportunities" } },
    { key: "section_featured_listings_description", value: { text: "Hand-picked franchise opportunities with verified potential." } },
    { key: "section_testimonials_heading", value: { text: "What Our Users Say" } },
    { key: "section_testimonials_description", value: { text: "Join thousands of professionals who have found success on Franchisia." } },
    { key: "section_blog_heading", value: { text: "Latest From Our Blog" } },
    { key: "section_blog_description", value: { text: "Insights, tips, and stories to help you make smarter franchise decisions." } },
    { key: "section_partners_heading", value: { text: "Our Partners" } },
    { key: "section_partners_description", value: { text: "Collaborating with industry leaders to deliver the best franchise experience." } },
    { key: "section_pricing_heading", value: { text: "Simple, Transparent Pricing" } },
    { key: "section_pricing_description", value: { text: "Choose the plan that fits your needs. No hidden fees." } },
    { key: "section_faq_heading", value: { text: "Frequently Asked Questions" } },
    { key: "section_faq_description", value: { text: "Got questions? We've got answers." } },
    { key: "section_contact_heading", value: { text: "Get in Touch" } },
    { key: "section_contact_description", value: { text: "Have questions? We'd love to hear from you." } },
    { key: "section_search_heading", value: { text: "Find Your Opportunity" } },
    { key: "section_search_description", value: { text: "Browse hundreds of franchise opportunities. Filter by industry, location, and investment range." } },
    { key: "section_industries_heading", value: { text: "Explore by Industry" } },
    { key: "section_industries_description", value: { text: "Browse franchise opportunities across 10+ thriving industries." } },
    { key: "section_featured_cities_heading", value: { text: "Opportunities by City" } },
    { key: "section_featured_cities_description", value: { text: "Explore franchise opportunities in top business hubs across India." } },
    { key: "section_newsletter_heading", value: { text: "Stay Updated" } },
    { key: "section_newsletter_description", value: { text: "Get the latest franchise opportunities, industry insights, and platform updates delivered to your inbox." } },
    { key: "section_global_network_heading", value: { text: "One Platform. Endless Franchise Opportunities." } },
    { key: "section_global_network_description", value: { text: "Connect with leading brands, investors, consultants, suppliers and entrepreneurs worldwide." } },
    { key: "section_media_heading", value: { text: "Community Gallery" } },
    { key: "section_media_description", value: { text: "Highlights from our events and community." } },
    { key: "section_events_heading", value: { text: "Upcoming Events" } },
    { key: "section_events_description", value: { text: "Join us at industry events, webinars, and networking sessions." } },
    { key: "section_careers_heading", value: { text: "Join Our Team" } },
    { key: "section_careers_description", value: { text: "Help us shape the future of franchising. Explore current openings." } },
  ];

  for (const s of sectionContent) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value },
    });
  }

  console.log("Seed complete! All CMS content has been populated.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
