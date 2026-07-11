import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import { ProtectedRoute, OnboardingRoute, AuthRedirect, AdminRoute } from "../components/AuthGuard";
import { useAuth } from "../context/AuthContext";

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

import RoleSelection from "../pages/onboarding/RoleSelection";
import RoleForm from "../pages/onboarding/RoleForm";
import OnboardingStatus from "../pages/onboarding/OnboardingStatus";
import DashboardHome from "../pages/dashboard";

import Discover from "../pages/dashboard/Discover";
import Companies from "../pages/dashboard/Companies";
import Messages from "../pages/dashboard/Messages";
import NotificationsPage from "../pages/dashboard/Notifications";
import Settings from "../pages/dashboard/Settings";
import Profile from "../pages/dashboard/Profile";
import CompanyProfile from "../pages/dashboard/CompanyProfile";
import ListingDetail from "../pages/listing/Detail";
import SavedListings from "../pages/dashboard/SavedListings";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminCompanies from "../pages/admin/AdminCompanies";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminVerification from "../pages/admin/AdminVerification";
import AdminReports from "../pages/admin/AdminReports";
import AdminNotifications from "../pages/admin/AdminNotifications";
import AdminMessages from "../pages/admin/AdminMessages";
import AdminMarketplace from "../pages/admin/AdminMarketplace";
import AdminApplications from "../pages/admin/AdminApplications";
import AdminFollowers from "../pages/admin/AdminFollowers";
import AdminAuditLogs from "../pages/admin/AdminAuditLogs";
import AdminSystemHealth from "../pages/admin/AdminSystemHealth";
import AdminSettingsPage from "../pages/admin/AdminSettings";
import AdminContent from "../pages/admin/AdminContent";

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

      <Route path="/onboarding/select-role" element={<OnboardingRoute><RoleSelection /></OnboardingRoute>} />
      <Route path="/onboarding/:role" element={<ProtectedRoute><RoleForm /></ProtectedRoute>} />
      <Route path="/onboarding/status" element={<ProtectedRoute><OnboardingStatus /></ProtectedRoute>} />

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/company/:id" element={<CompanyProfile />} />
        <Route path="/listing/:slug" element={<ListingDetail />} />
        <Route path="/saved-listings" element={<SavedListings />} />

        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/verification" element={<AdminRoute><AdminVerification /></AdminRoute>} />
        <Route path="/admin/companies" element={<AdminRoute><AdminCompanies /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
        <Route path="/admin/notifications" element={<AdminRoute><AdminNotifications /></AdminRoute>} />
        <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />
        <Route path="/admin/marketplace" element={<AdminRoute><AdminMarketplace /></AdminRoute>} />
        <Route path="/admin/applications" element={<AdminRoute><AdminApplications /></AdminRoute>} />
        <Route path="/admin/followers" element={<AdminRoute><AdminFollowers /></AdminRoute>} />
        <Route path="/admin/audit-logs" element={<AdminRoute><AdminAuditLogs /></AdminRoute>} />
        <Route path="/admin/system-health" element={<AdminRoute><AdminSystemHealth /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
        <Route path="/admin/content" element={<AdminRoute><AdminContent /></AdminRoute>} />
      </Route>
    </Routes>
  );
}