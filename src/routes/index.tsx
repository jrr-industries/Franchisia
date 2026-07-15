import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import { ProtectedRoute, OnboardingRoute, AuthRedirect, AdminRoute } from "../components/AuthGuard";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";

import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Pricing from "../pages/public/Pricing";
import Contact from "../pages/public/Contact";
import FAQ from "../pages/public/FAQ";
import Privacy from "../pages/public/Privacy";
import Terms from "../pages/public/Terms";
import Blog from "../pages/public/Blog";
import Partners from "../pages/public/Partners";
import Careers from "../pages/public/Careers";
import Events from "../pages/public/Events";
import Payment from "../pages/public/Payment";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import VerifyEmail from "../pages/auth/VerifyEmail";

const RoleSelection = lazy(() => import("../pages/onboarding/RoleSelection"));
const RoleForm = lazy(() => import("../pages/onboarding/RoleForm"));
const OnboardingStatus = lazy(() => import("../pages/onboarding/OnboardingStatus"));
const DashboardHome = lazy(() => import("../pages/dashboard"));

const Discover = lazy(() => import("../pages/dashboard/Discover"));
const Companies = lazy(() => import("../pages/dashboard/Companies"));
const Messages = lazy(() => import("../pages/dashboard/Messages"));
const NotificationsPage = lazy(() => import("../pages/dashboard/Notifications"));
const Settings = lazy(() => import("../pages/dashboard/Settings"));
const Profile = lazy(() => import("../pages/dashboard/Profile"));
const CompanyProfile = lazy(() => import("../pages/dashboard/CompanyProfile"));
const ListingDetail = lazy(() => import("../pages/listing/Detail"));
const SavedListings = lazy(() => import("../pages/dashboard/SavedListings"));
const PoliciesTerms = lazy(() => import("../pages/dashboard/PoliciesTerms"));
const MyMarketplace = lazy(() => import("../pages/dashboard/MyMarketplace"));
const Applications = lazy(() => import("../pages/dashboard/Applications"));
const Analytics = lazy(() => import("../pages/dashboard/Analytics"));
const Followers = lazy(() => import("../pages/dashboard/Followers"));
const Documents = lazy(() => import("../pages/dashboard/Documents"));

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminHome = lazy(() => import("../pages/admin/AdminHome"));
const AdminUsers = lazy(() => import("../pages/admin/AdminUsers"));
const AdminCompanies = lazy(() => import("../pages/admin/AdminCompanies"));
const AdminAnalytics = lazy(() => import("../pages/admin/AdminAnalytics"));
const AdminVerification = lazy(() => import("../pages/admin/AdminVerification"));
const AdminReports = lazy(() => import("../pages/admin/AdminReports"));
const AdminNotifications = lazy(() => import("../pages/admin/AdminNotifications"));
const AdminMessages = lazy(() => import("../pages/admin/AdminMessages"));
const AdminMarketplace = lazy(() => import("../pages/admin/AdminMarketplace"));
const AdminApplications = lazy(() => import("../pages/admin/AdminApplications"));
const AdminFollowers = lazy(() => import("../pages/admin/AdminFollowers"));
const AdminAuditLogs = lazy(() => import("../pages/admin/AdminAuditLogs"));
const AdminSystemHealth = lazy(() => import("../pages/admin/AdminSystemHealth"));
const AdminSettingsPage = lazy(() => import("../pages/admin/AdminSettings"));
const AdminContent = lazy(() => import("../pages/admin/AdminContent"));
const AdminPolicies = lazy(() => import("../pages/admin/AdminPolicies"));
const AdminHeroEditor = lazy(() => import("../pages/admin/AdminHeroEditor"));
const AdminStatisticsEditor = lazy(() => import("../pages/admin/AdminStatisticsEditor"));
const AdminMarketplaceSearchEditor = lazy(() => import("../pages/admin/AdminMarketplaceSearchEditor"));
const AdminFeaturesEditor = lazy(() => import("../pages/admin/AdminFeaturesEditor"));
const AdminUserRolesEditor = lazy(() => import("../pages/admin/AdminUserRolesEditor"));
const AdminHowItWorksEditor = lazy(() => import("../pages/admin/AdminHowItWorksEditor"));
const AdminFeaturedCompanies = lazy(() => import("../pages/admin/AdminFeaturedCompanies"));
const AdminFeaturedOpportunities = lazy(() => import("../pages/admin/AdminFeaturedOpportunities"));
const AdminGlobalNetworkEditor = lazy(() => import("../pages/admin/AdminGlobalNetworkEditor"));
const AdminMapLocationsEditor = lazy(() => import("../pages/admin/AdminMapLocationsEditor"));
const AdminGlobalMetricsEditor = lazy(() => import("../pages/admin/AdminGlobalMetricsEditor"));
const AdminIndustriesEditor = lazy(() => import("../pages/admin/AdminIndustriesEditor"));
const AdminCitiesEditor = lazy(() => import("../pages/admin/AdminCitiesEditor"));
const AdminAIRecommendationsEditor = lazy(() => import("../pages/admin/AdminAIRecommendationsEditor"));
const AdminTestimonialsEditor = lazy(() => import("../pages/admin/AdminTestimonialsEditor"));
const AdminBlogEditor = lazy(() => import("../pages/admin/AdminBlogEditor"));
const AdminEventsEditor = lazy(() => import("../pages/admin/AdminEventsEditor"));
const AdminCareersEditor = lazy(() => import("../pages/admin/AdminCareersEditor"));
const AdminPartnersEditor = lazy(() => import("../pages/admin/AdminPartnersEditor"));
const AdminMediaEditor = lazy(() => import("../pages/admin/AdminMediaEditor"));
const AdminPricingEditor = lazy(() => import("../pages/admin/AdminPricingEditor"));
const AdminNewsletterEditor = lazy(() => import("../pages/admin/AdminNewsletterEditor"));
const AdminFAQEditor = lazy(() => import("../pages/admin/AdminFAQEditor"));
const AdminContactEditor = lazy(() => import("../pages/admin/AdminContactEditor"));
const AdminFooterEditor = lazy(() => import("../pages/admin/AdminFooterEditor"));

// Keep existing lazy imports for backward compat
const AdminBlog = lazy(() => import("../pages/admin/AdminBlog"));
const AdminCareers = lazy(() => import("../pages/admin/AdminCareers"));
const AdminEvents = lazy(() => import("../pages/admin/AdminEvents"));
const AdminPartners = lazy(() => import("../pages/admin/AdminPartners"));
const AdminTestimonials = lazy(() => import("../pages/admin/AdminTestimonials"));
const AdminSiteFAQ = lazy(() => import("../pages/admin/AdminSiteFAQ"));
const AdminPlans = lazy(() => import("../pages/admin/AdminPlans"));
const AdminMedia = lazy(() => import("../pages/admin/AdminMedia"));
const AdminHero = lazy(() => import("../pages/admin/AdminHero"));
const AdminHeroSlides = lazy(() => import("../pages/admin/AdminHeroSlides"));
const AdminUserTypes = lazy(() => import("../pages/admin/AdminUserTypes"));
const AdminFeatures = lazy(() => import("../pages/admin/AdminFeatures"));
const AdminHowItWorks = lazy(() => import("../pages/admin/AdminHowItWorks"));
const AdminCities = lazy(() => import("../pages/admin/AdminCities"));
const AdminNavigation = lazy(() => import("../pages/admin/AdminNavigation"));
const AdminStatistics = lazy(() => import("../pages/admin/AdminStatistics"));
const AdminFooter = lazy(() => import("../pages/admin/AdminFooter"));
const AdminPages = lazy(() => import("../pages/admin/AdminPages"));
const AdminContact = lazy(() => import("../pages/admin/AdminContact"));

function SuspenseFallback() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin 1s linear infinite" }} />
    </div>
  );
}

function PageLoading() {
  return (
    <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
      <Loader />
    </div>
  );
}

function HomePage() {
  return <Home />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/events" element={<Events />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
          <Route path="/signup" element={<AuthRedirect><Signup /></AuthRedirect>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        <Route path="/onboarding/select-role" element={<OnboardingRoute><Suspense fallback={<PageLoading />}><RoleSelection /></Suspense></OnboardingRoute>} />
        <Route path="/onboarding/:role" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><RoleForm /></Suspense></ProtectedRoute>} />
        <Route path="/onboarding/status" element={<ProtectedRoute><Suspense fallback={<PageLoading />}><OnboardingStatus /></Suspense></ProtectedRoute>} />

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Suspense fallback={<PageLoading />}><DashboardHome /></Suspense>} />
          <Route path="/messages" element={<Suspense fallback={<PageLoading />}><Messages /></Suspense>} />
          <Route path="/notifications" element={<Suspense fallback={<PageLoading />}><NotificationsPage /></Suspense>} />
          <Route path="/settings" element={<Suspense fallback={<PageLoading />}><Settings /></Suspense>} />
          <Route path="/profile" element={<Suspense fallback={<PageLoading />}><Profile /></Suspense>} />
          <Route path="/company/:id" element={<Suspense fallback={<PageLoading />}><CompanyProfile /></Suspense>} />
          <Route path="/listing/:slug" element={<Suspense fallback={<PageLoading />}><ListingDetail /></Suspense>} />
          <Route path="/saved-listings" element={<Suspense fallback={<PageLoading />}><SavedListings /></Suspense>} />
          <Route path="/discover" element={<Suspense fallback={<PageLoading />}><Discover /></Suspense>} />
          <Route path="/companies" element={<Suspense fallback={<PageLoading />}><Companies /></Suspense>} />
          <Route path="/dashboard/listings" element={<Suspense fallback={<PageLoading />}><MyMarketplace /></Suspense>} />
          <Route path="/dashboard/applications" element={<Suspense fallback={<PageLoading />}><Applications /></Suspense>} />
          <Route path="/dashboard/analytics" element={<Suspense fallback={<PageLoading />}><Analytics /></Suspense>} />
          <Route path="/dashboard/followers" element={<Suspense fallback={<PageLoading />}><Followers /></Suspense>} />
          <Route path="/dashboard/documents" element={<Suspense fallback={<PageLoading />}><Documents /></Suspense>} />
          <Route path="/dashboard/policies" element={<Suspense fallback={<PageLoading />}><PoliciesTerms /></Suspense>} />

          <Route path="/admin" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminDashboard /></Suspense></AdminRoute>} />
          <Route path="/admin/home" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminHome /></Suspense></AdminRoute>} />
          <Route path="/admin/home/hero" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminHeroEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/statistics" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminStatisticsEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/marketplace-search" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminMarketplaceSearchEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/features" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminFeaturesEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/user-roles" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminUserRolesEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/how-it-works" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminHowItWorksEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/featured-companies" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminFeaturedCompanies /></Suspense></AdminRoute>} />
          <Route path="/admin/home/featured-opportunities" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminFeaturedOpportunities /></Suspense></AdminRoute>} />
          <Route path="/admin/home/global-network" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminGlobalNetworkEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/map-locations" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminMapLocationsEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/global-metrics" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminGlobalMetricsEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/industries" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminIndustriesEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/cities" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminCitiesEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/ai-recommendations" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminAIRecommendationsEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/testimonials" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminTestimonialsEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/blog" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminBlogEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/events" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminEventsEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/careers" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminCareersEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/partners" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminPartnersEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/media" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminMediaEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/pricing" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminPricingEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/newsletter" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminNewsletterEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/faq" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminFAQEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/contact" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminContactEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/home/footer" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminFooterEditor /></Suspense></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminUsers /></Suspense></AdminRoute>} />
          <Route path="/admin/verification" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminVerification /></Suspense></AdminRoute>} />
          <Route path="/admin/companies" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminCompanies /></Suspense></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminAnalytics /></Suspense></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminReports /></Suspense></AdminRoute>} />
          <Route path="/admin/notifications" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminNotifications /></Suspense></AdminRoute>} />
          <Route path="/admin/messages" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminMessages /></Suspense></AdminRoute>} />
          <Route path="/admin/marketplace" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminMarketplace /></Suspense></AdminRoute>} />
          <Route path="/admin/applications" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminApplications /></Suspense></AdminRoute>} />
          <Route path="/admin/followers" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminFollowers /></Suspense></AdminRoute>} />
          <Route path="/admin/audit-logs" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminAuditLogs /></Suspense></AdminRoute>} />
          <Route path="/admin/system-health" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminSystemHealth /></Suspense></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminSettingsPage /></Suspense></AdminRoute>} />
          <Route path="/admin/content" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminContent /></Suspense></AdminRoute>} />
          <Route path="/admin/policies" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminPolicies /></Suspense></AdminRoute>} />
          {/* Legacy CMS routes for backward compatibility */}
          <Route path="/admin/cms/blog" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminBlog /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/careers" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminCareers /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/events" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminEvents /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/partners" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminPartners /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/testimonials" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminTestimonials /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/faq" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminSiteFAQ /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/plans" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminPlans /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/media" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminMedia /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/hero" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminHero /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/hero-slides" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminHeroSlides /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/user-types" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminUserTypes /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/features" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminFeatures /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/how-it-works" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminHowItWorks /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/cities" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminCities /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/navigation" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminNavigation /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/pages" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminPages /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/statistics" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminStatistics /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/footer" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminFooter /></Suspense></AdminRoute>} />
          <Route path="/admin/cms/contact" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminContact /></Suspense></AdminRoute>} />
        </Route>
      </Routes>
    </Suspense>
  );
}
