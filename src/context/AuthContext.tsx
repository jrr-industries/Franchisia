import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { authClient } from "../lib/auth-client";

const API = "/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const manualLogout = useRef(false);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch(`${API}/auth/status`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setUser({
            ...data,
            onboardingCompleted: data.onboardingCompleted ?? false,
          });
          return { user: data };
        }
      }
    } catch {
      // Not authenticated
    }
    setUser(null);
    return null;
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        if (manualLogout.current) {
          manualLogout.current = false;
          setLoading(false);
          return;
        }
        await refreshSession();
      } catch {
        // Not authenticated
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [refreshSession]);

  const login = useCallback(async (email, password) => {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) throw new Error(error.message || error.code || "Login failed");
    const session = await refreshSession();
    return session?.user ?? null;
  }, [refreshSession]);

  const checkEmail = useCallback(async (email) => {
    const res = await fetch(`${API}/auth/check-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.status === 409) {
      const err = await res.json();
      throw new Error(err.error);
    }
    if (!res.ok) throw new Error("Failed to check email");
    return true;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    console.log("[Signup] Step 1: Checking email availability...");
    await checkEmail(email);
    console.log("[Signup] Step 2: Email available, calling Better Auth signUp...");
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) {
      console.error("[Signup] Better Auth signUp FAILED:", error);
      throw new Error(error.message || error.code || "Signup failed");
    }
    console.log("[Signup] Step 3: Better Auth user created. Sending OTP...");
    try {
      const otpRes = await fetch(`${API}/auth/send-otp`, { method: "POST", credentials: "include" });
      console.log("[Signup] OTP response status:", otpRes.status);
      if (otpRes.ok) {
        const otpData = await otpRes.json();
        console.log("[Signup] OTP response body:", JSON.stringify(otpData));
      } else {
        const otpErr = await otpRes.json();
        console.warn("[Signup] OTP request FAILED:", otpRes.status, JSON.stringify(otpErr));
      }
    } catch (fetchErr) {
      console.error("[Signup] OTP fetch EXCEPTION:", fetchErr);
    }
    console.log("[Signup] Step 4: Refreshing session...");
    const session = await refreshSession();
    console.log("[Signup] Step 5: Signup complete. User:", JSON.stringify(session?.user));
    return session?.user ?? null;
  }, [refreshSession, checkEmail]);

  const logout = useCallback(async () => {
    manualLogout.current = true;
    try {
      await authClient.signOut({ fetchOptions: { disableSignal: true } });
    } catch {}
    try {
      await fetch(`${API}/auth/sign-out`, { method: "POST", credentials: "include" });
    } catch {}
    document.cookie = "better-auth.session_token=; Max-Age=0; Path=/;";
    document.cookie = "better-auth.session_data=; Max-Age=0; Path=/;";
    setUser(null);
  }, []);

  const sendVerificationEmail = useCallback(async () => {
    const res = await fetch(`${API}/auth/send-otp`, {
      method: "POST", credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to send verification code");
    }
    return res.json();
  }, []);

  const verifyOtp = useCallback(async (otp) => {
    const res = await fetch(`${API}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ otp }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Verification failed");
    }
    return res.json();
  }, []);

  const resendOtp = useCallback(async () => {
    const res = await fetch(`${API}/auth/resend-otp`, {
      method: "POST", credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to resend code");
    }
    return res.json();
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const { error } = await authClient.forgetPassword({ email });
    if (error) throw new Error(error.message || "Failed to send reset email");
  }, []);

  const resetPassword = useCallback(async (newPassword, token) => {
    const { error } = await authClient.resetPassword({ newPassword, token });
    if (error) throw new Error(error.message || "Failed to reset password");
  }, []);

  const [socialLoading, setSocialLoading] = useState(null);

  const loginSocial = useCallback(async (provider) => {
    setSocialLoading(provider);
    try {
      const { error } = await authClient.signIn.social({ provider, callbackURL: "/onboarding/select-role" });
      if (error) throw new Error(error.message || "Social login failed");
    } catch (err) {
      setSocialLoading(null);
      throw err;
    }
  }, []);

  const selectRole = useCallback(async (role) => {
    const res = await fetch(`${API}/auth/select-role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Role selection failed");
    }
    const data = await res.json();
    setUser((prev) => ({ ...prev, ...data.user }));
    return data;
  }, []);

  const updateOnboarding = useCallback(async (role, formData) => {
    const res = await fetch(`${API}/onboarding/${role}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Update failed");
    }
    const data = await res.json();
    if (data.user) setUser((prev) => ({ ...prev, ...data.user }));
    return data;
  }, []);

  const uploadDocument = useCallback(async (docData) => {
    const res = await fetch(`${API}/onboarding/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(docData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Document upload failed");
    }
    return res.json();
  }, []);

  const submitForReview = useCallback(async () => {
    const res = await fetch(`${API}/onboarding/submit-for-review`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Submission failed");
    }
    const data = await res.json();
    if (data.user) setUser((prev) => ({ ...prev, ...data.user }));
    return data;
  }, []);

  const fetchAuthStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API}/auth/status`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        return data;
      }
    } catch {}
    setUser(null);
    return null;
  }, []);

  const isAdmin = user?.role === "admin";
  const isFranchisor = user?.role === "franchisor";
  const isFranchisee = user?.role === "franchisee";
  const isConsultant = user?.role === "consultant";
  const isInvestor = user?.role === "investor";
  const isSupplier = user?.role === "supplier";
  const isVerified = user?.verified === true;
  const hasRole = useCallback((...roles) => roles.includes(user?.role), [user?.role]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin,
      isFranchisor,
      isFranchisee,
      isConsultant,
      isInvestor,
      isSupplier,
      isVerified,
      hasRole,
      loading,
      socialLoading,
      login,
      signup,
      checkEmail,
      logout,
      sendVerificationEmail,
      verifyOtp,
      resendOtp,
      forgotPassword,
      resetPassword,
      loginSocial,
      selectRole,
      updateOnboarding,
      uploadDocument,
      submitForReview,
      fetchAuthStatus,
      refreshSession,
      updateUser: setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
