import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Inbox,
  LogOut,
  Settings2,
  UserRoundPlus,
  Users,
} from "lucide-react";
import api from "../api/api";
import useAdminAuth from "./useAdminAuth.js";
import { getAdminApiErrorMessage } from "./adminApiError.js";

const quickActions = [
  {
    label: "Add or edit teachers",
    description: "Update bios, roles, and profile images for the faculty page.",
    to: "/admin/teachers",
    eyebrow: "Faculty",
    icon: UserRoundPlus,
  },
  {
    label: "Refresh programs",
    description: "Keep homepage program cards current and easy to scan.",
    to: "/admin/programs",
    eyebrow: "Programs",
    icon: BookOpen,
  },
  {
    label: "Review incoming messages",
    description: "Check trial requests and teaching inquiries from one inbox.",
    to: "/admin/messages",
    eyebrow: "Inbox",
    icon: Inbox,
  },
  {
    label: "Update admin access",
    description: "Change the password your client uses to access the dashboard.",
    to: "/admin/settings",
    eyebrow: "Security",
    icon: Settings2,
  },
];

const statsBlueprint = [
  {
    label: "Teachers",
    description: "Faculty profiles and bios.",
    to: "/admin/teachers",
    icon: Users,
  },
  {
    label: "Programs",
    description: "Homepage offerings and copy.",
    to: "/admin/programs",
    icon: BookOpen,
  },
  {
    label: "Messages",
    description: "Trial requests and inquiries.",
    to: "/admin/messages",
    icon: Inbox,
  },
];

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const [statsError, setStatsError] = useState("");
  const [stats, setStats] = useState([
    { ...statsBlueprint[0], value: "-" },
    { ...statsBlueprint[1], value: "-" },
    { ...statsBlueprint[2], value: "-" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsError("");

      const [
        teachersRes,
        programsRes,
        messagesRes,
        trialSessionsRes,
      ] = await Promise.allSettled([
          api.get("/api/teachers"),
          api.get("/api/programs"),
          api.get("/api/work-applications"),
          api.get("/api/trial-sessions"),
      ]);

      const getCount = (result) =>
        result.status === "fulfilled" && Array.isArray(result.value.data)
          ? result.value.data.length
          : null;

      const teacherCount = getCount(teachersRes);
      const programCount = getCount(programsRes);
      const messageCount = getCount(messagesRes);
      const trialSessionCount = getCount(trialSessionsRes);
      const totalInboxCount =
        messageCount !== null && trialSessionCount !== null
          ? messageCount + trialSessionCount
          : null;

      setStats([
        {
          ...statsBlueprint[0],
          value: teacherCount === null ? "N/A" : String(teacherCount),
        },
        {
          ...statsBlueprint[1],
          value: programCount === null ? "N/A" : String(programCount),
        },
        {
          ...statsBlueprint[2],
          value: totalInboxCount === null ? "N/A" : String(totalInboxCount),
        },
      ]);

      const firstRejected = [
        teachersRes,
        programsRes,
        messagesRes,
        trialSessionsRes,
      ].find((result) => result.status === "rejected");

      if (firstRejected) {
        console.error("Dashboard stats fetch error:", firstRejected.reason);
        setStatsError(
          getAdminApiErrorMessage(
            firstRejected.reason,
            "Some dashboard stats are temporarily unavailable."
          )
        );
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Pera Operations</p>
          <h1 className="admin-title">Dashboard</h1>
          <p className="admin-subtitle">
            A cleaner control room for website content, faculty updates, and
            incoming requests.
          </p>
        </div>

        <div className="admin-header-actions">
          <Link className="admin-button admin-button-secondary" to="/admin/messages">
            Open inbox
          </Link>

          <button className="admin-button" onClick={handleLogout}>
            <LogOut aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {statsError ? <div className="admin-system-alert">{statsError}</div> : null}

      <div className="admin-dashboard-grid">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Link to={item.to} className="admin-dashboard-card" key={item.label}>
              <div className="admin-dashboard-card-top">
                <span className="admin-dashboard-card-icon">
                  <Icon aria-hidden="true" />
                </span>

                <span className="admin-dashboard-link">
                  Open
                  <ArrowUpRight aria-hidden="true" />
                </span>
              </div>

              <strong>{item.value}</strong>
              <h3>{item.label}</h3>
              <p>{item.description}</p>
            </Link>
          );
        })}
      </div>

      <section className="admin-dashboard-section">
        <div className="admin-dashboard-section-head">
          <div>
            <p className="admin-eyebrow">Quick Actions</p>
            <h2>Common Tasks</h2>
            <p>
              The most frequent edits your client will likely need, grouped into
              a tighter and more organized home screen.
            </p>
          </div>
        </div>

        <div className="admin-quick-actions">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link to={action.to} key={action.label}>
                <div className="admin-quick-action-top">
                  <span className="admin-quick-action-pill">{action.eyebrow}</span>
                  <Icon aria-hidden="true" />
                </div>

                <h3>{action.label}</h3>
                <p>{action.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
