import { useState } from "react";
import api from "../api/api";
import useAdminAuth from "./useAdminAuth.js";

const initialFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function SettingsAdmin() {
  const { adminEmail } = useAdminAuth();
  const [form, setForm] = useState(initialFormState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/api/admin/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setForm(initialFormState);
      setSuccess(response.data?.message || "Password updated successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Password update failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Admin Panel</p>
          <h1 className="admin-title">Settings</h1>
          <p className="admin-subtitle">
            Update the admin password your client uses to access the dashboard.
          </p>
        </div>
      </div>

      <div className="admin-settings-grid">
        <section className="admin-settings-card">
          <div>
            <p className="admin-eyebrow">Account</p>
            <h2>Sign-in details</h2>
          </div>

          <div className="admin-settings-meta">
            <span>Admin email</span>
            <strong>{adminEmail || "Admin account"}</strong>
          </div>

          <p className="admin-settings-note">
            Password changes take effect immediately and keep the current admin
            session signed in.
          </p>
        </section>

        <section className="admin-settings-card">
          <div>
            <p className="admin-eyebrow">Security</p>
            <h2>Change password</h2>
          </div>

          <p className="admin-settings-helper">
            Use at least 8 characters and choose something different from the
            current password.
          </p>

          <form className="admin-settings-form" onSubmit={handleSubmit}>
            <label htmlFor="currentPassword">
              Current password
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={handleChange}
                required
              />
            </label>

            <label htmlFor="newPassword">
              New password
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={form.newPassword}
                onChange={handleChange}
                required
              />
            </label>

            <label htmlFor="confirmPassword">
              Confirm new password
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </label>

            {error ? <p className="admin-auth-error">{error}</p> : null}
            {success ? <p className="admin-auth-success">{success}</p> : null}

            <button className="admin-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
