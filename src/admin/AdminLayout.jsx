import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  BookOpen,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  Settings as SettingsIcon,
  Users,
} from "lucide-react";
import api from "../api/api";

const navItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Programs", to: "/admin/programs", icon: BookOpen },
  { label: "Teachers", to: "/admin/teachers", icon: Users },
  { label: "Messages", to: "/admin/messages", icon: Inbox },
  { label: "Settings", to: "/admin/settings", icon: SettingsIcon },
];

export default function AdminLayout() {
  const [systemMessage, setSystemMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchSystemStatus = async () => {
      try {
        const response = await api.get("/api/admin/auth/bootstrap-status");

        if (!isMounted) {
          return;
        }

        setSystemMessage(
          response.data?.databaseConnected === false
            ? response.data?.formNotificationConfigured
              ? "MongoDB is currently unavailable. Programs and teachers will use the last saved snapshot when possible. New form submissions are still being forwarded by email, but inbox items and password changes will recover after Atlas access is restored."
              : "MongoDB is currently unavailable. Programs and teachers will use the last saved snapshot when possible, but inbox items and password changes will remain unavailable until Atlas access is restored."
            : ""
        );
      } catch {
        if (isMounted) {
          setSystemMessage("");
        }
      }
    };

    fetchSystemStatus();

    const intervalId = window.setInterval(fetchSystemStatus, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-shell">
          <div className="admin-brand-card">
            <img
              className="admin-brand-mark"
              src="/pera-logo.png"
              alt="Pera Music School logo"
            />

            <div className="admin-brand-copy">
              <span className="admin-brand-pill">Admin Panel</span>
              <h2 className="admin-logo">Pera Music School</h2>
            </div>
          </div>

          <div className="admin-nav-group">
            <p className="admin-sidebar-label">Navigation</p>

            <nav className="admin-nav">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/admin"}
                    className={({ isActive }) => (isActive ? "active" : undefined)}
                  >
                    <Icon aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="admin-sidebar-footer">
            <Link className="admin-sidebar-link" to="/">
              <span>Visit Website</span>
              <ExternalLink aria-hidden="true" />
            </Link>
          </div>
        </div>
      </aside>

      <main className="admin-content">
        <div className="admin-content-inner">
          {systemMessage ? (
            <div className="admin-system-alert">{systemMessage}</div>
          ) : null}

          <Outlet />
        </div>
      </main>
    </div>
  );
}
