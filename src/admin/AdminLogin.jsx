import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import useAdminAuth from "./useAdminAuth.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isCheckingAuth, login } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/admin";

  if (!isCheckingAuth && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-auth-shell">
      <form className="admin-auth-card" onSubmit={handleSubmit}>
        <div className="admin-auth-brand">
          <img src="/pera-logo.png" alt="Pera Music School logo" />

          <div>
            <p className="admin-eyebrow">Pera Music School</p>
            <h1>Admin sign in</h1>
          </div>
        </div>

        <div>
          <p className="admin-auth-text">
            Use your admin email and password to access the dashboard.
          </p>
        </div>

        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error ? <p className="admin-auth-error">{error}</p> : null}

        <button className="admin-button admin-auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
