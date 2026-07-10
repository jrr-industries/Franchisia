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
        setUser({
          ...data,
          onboardingCompleted: data.onboardingCompleted ?? false,
        });
        return { user: data };
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

  const signup = useCallback(async (name, email, password) => {
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) throw new Error(error.message || error.code || "Signup failed");
    const session = await refreshSession();
    return session?.user ?? null;
  }, [refreshSession]);

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
    const { error } = await authClient.sendVerificationEmail();
    if (error) throw new Error(error.message || "Failed to send verification email");
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const { error } = await authClient.forgetPassword({ email });
    if (error) throw new Error(error.message || "Failed to send reset email");
  }, []);

  const resetPassword = useCallback(async (newPassword, token) => {
    const { error } = await authClient.resetPassword({ newPassword, token });
    if (error) throw new Error(error.message || "Failed to reset password");
  }, []);

  const loginSocial = useCallback(async (provider) => {
    await authClient.signIn.social({ provider, callbackURL: "/onboarding/select-role" });
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
    const res = await fetch(`${API}/auth/status`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch status");
    const data = await res.json();
    setUser(data);
    return data;
  }, []);

  const isAdmin = user?.role === "admin";
  const isVerified = user?.verified === true;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin,
      isVerified,
      loading,
      login,
      signup,
      logout,
      sendVerificationEmail,
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
