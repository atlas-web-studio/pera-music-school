import { useEffect, useState } from "react";
import api from "../api/api";
import AdminAuthContext from "./adminAuthContext.js";

export default function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  const refreshAuth = async () => {
    setIsCheckingAuth(true);

    try {
      const res = await api.get("/api/admin/auth/me");
      setIsAuthenticated(Boolean(res.data?.isAuthenticated));
      setAdminEmail(res.data?.email || "");
    } catch {
      setIsAuthenticated(false);
      setAdminEmail("");
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const checkInitialAuth = async () => {
      try {
        const res = await api.get("/api/admin/auth/me");

        if (!isActive) {
          return;
        }

        setIsAuthenticated(Boolean(res.data?.isAuthenticated));
        setAdminEmail(res.data?.email || "");
      } catch {
        if (!isActive) {
          return;
        }

        setIsAuthenticated(false);
        setAdminEmail("");
      } finally {
        if (isActive) {
          setIsCheckingAuth(false);
        }
      }
    };

    void checkInitialAuth();

    return () => {
      isActive = false;
    };
  }, []);

  const login = async (email, password) => {
    await api.post("/api/admin/auth/login", { email, password });
    await refreshAuth();
  };

  const logout = async () => {
    try {
      await api.post("/api/admin/auth/logout");
    } finally {
      setIsAuthenticated(false);
      setAdminEmail("");
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        isCheckingAuth,
        adminEmail,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}
