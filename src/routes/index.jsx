import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import { AdminRoute } from '../components/ProtectedRoute';

import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Pricing from '../pages/public/Pricing';
import Contact from '../pages/public/Contact';
import FAQ from '../pages/public/FAQ';
import Privacy from '../pages/public/Privacy';
import Terms from '../pages/public/Terms';

import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

import DashboardHome from '../pages/dashboard/DashboardHome';
import Discover from '../pages/dashboard/Discover';
import Companies from '../pages/dashboard/Companies';
import Messages from '../pages/dashboard/Messages';
import NotificationsPage from '../pages/dashboard/Notifications';
import Settings from '../pages/dashboard/Settings';
import Profile from '../pages/dashboard/Profile';
import CompanyProfile from '../pages/dashboard/CompanyProfile';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminCompanies from '../pages/admin/AdminCompanies';
import AdminAnalytics from '../pages/admin/AdminAnalytics';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/company/:id" element={<CompanyProfile />} />

        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/companies" element={<AdminRoute><AdminCompanies /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
      </Route>
    </Routes>
  );
}
