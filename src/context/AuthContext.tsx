import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authClient } from "../lib/auth-client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (session?.user) {
          setUser({
            ...session.user,
            onboardingCompleted: session.user.onboardingCompleted ?? false,
          });
        }
      } catch {
        // Not authenticated
      } finally {
        setLoading(false);
      }
    };
    init();

    const unsubscribe = authClient.$store.listen("session", (session) => {
      if (session?.user) {
        setUser({
          ...session.user,
          onboardingCompleted: session.user.onboardingCompleted ?? false,
        });
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const refreshSession = useCallback(async () => {
    const { data: session } = await authClient.getSession();
    if (session?.user) {
      setUser({
        ...session.user,
        onboardingCompleted: session.user.onboardingCompleted ?? false,
      });
    }
    return session;
  }, []);

  const login = useCallback(async (email, password) => {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) throw new Error(error.message || error.code || "Login failed");
    await refreshSession();
  }, [refreshSession]);

  const signup = useCallback(async (name, email, password) => {
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) throw new Error(error.message || error.code || "Signup failed");
    await refreshSession();
  }, [refreshSession]);

  const logout = useCallback(async () => {
    await authClient.signOut();
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
    await authClient.signIn.social({ provider });
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin,
      loading,
      login,
      signup,
      logout,
      sendVerificationEmail,
      forgotPassword,
      resetPassword,
      loginSocial,
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
