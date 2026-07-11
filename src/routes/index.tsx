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

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
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
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin 1s linear infinite" }} />
    </div>;
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
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
          <Route path="/discover" element={<Suspense fallback={<PageLoading />}><Discover /></Suspense>} />
          <Route path="/companies" element={<Suspense fallback={<PageLoading />}><Companies /></Suspense>} />
          <Route path="/messages" element={<Suspense fallback={<PageLoading />}><Messages /></Suspense>} />
          <Route path="/notifications" element={<Suspense fallback={<PageLoading />}><NotificationsPage /></Suspense>} />
          <Route path="/settings" element={<Suspense fallback={<PageLoading />}><Settings /></Suspense>} />
          <Route path="/profile" element={<Suspense fallback={<PageLoading />}><Profile /></Suspense>} />
          <Route path="/company/:id" element={<Suspense fallback={<PageLoading />}><CompanyProfile /></Suspense>} />
          <Route path="/listing/:slug" element={<Suspense fallback={<PageLoading />}><ListingDetail /></Suspense>} />
          <Route path="/saved-listings" element={<Suspense fallback={<PageLoading />}><SavedListings /></Suspense>} />

          <Route path="/admin" element={<AdminRoute><Suspense fallback={<PageLoading />}><AdminDashboard /></Suspense></AdminRoute>} />
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
        </Route>
      </Routes>
    </Suspense>
  );
}
