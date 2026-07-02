import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isDatabaseConnected } from "../config/db.js";
import protectAdmin from "../middleware/protectAdmin.js";
import AdminCredential from "../models/AdminCredential.js";
import { isFormNotificationConfigured } from "../services/formNotificationService.js";

const router = express.Router();

function hasAuthConfig() {
  return Boolean(process.env.JWT_SECRET);
}

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function hasEnvAdminConfig() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
}

function canUseEnvFallback() {
  return process.env.NODE_ENV !== "production" && hasEnvAdminConfig();
}

function getEnvAdmin() {
  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || !password) {
    return null;
  }

  return {
    email,
    password,
  };
}

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 2 * 60 * 60 * 1000,
  };
}

function signAdminToken(admin) {
  return jwt.sign(
    {
      role: "admin",
      adminId: admin._id?.toString() || null,
      email: admin.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
}

async function ensureAdminAccount() {
  const existingAdmin = await AdminCredential.findOne();

  if (existingAdmin) {
    return existingAdmin;
  }

  const seededEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  const seededPassword = process.env.ADMIN_PASSWORD;

  if (!seededEmail || !seededPassword) {
    return null;
  }

  const passwordHash = await bcrypt.hash(seededPassword, 10);

  return AdminCredential.findOneAndUpdate(
    { email: seededEmail },
    {
      $setOnInsert: {
        email: seededEmail,
        passwordHash,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );
}

async function getAdminFromDecoded(decoded) {
  if (decoded?.adminId) {
    const admin = await AdminCredential.findById(decoded.adminId);

    if (admin) {
      return admin;
    }
  }

  return ensureAdminAccount();
}

router.post("/login", async (req, res) => {
  try {
    if (!hasAuthConfig()) {
      return res.status(500).json({
        message: "Admin auth is not configured on the server.",
      });
    }

    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    let admin = null;
    let adminLookupFailed = false;

    if (isDatabaseConnected()) {
      try {
        admin = await ensureAdminAccount();
      } catch (lookupError) {
        adminLookupFailed = true;
        console.error("Admin lookup error during login:", lookupError.message);
      }
    } else {
      adminLookupFailed = true;
    }

    if (admin) {
      if (normalizedEmail !== admin.email) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      const isMatch = await bcrypt.compare(password, admin.passwordHash);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
    } else if (adminLookupFailed && canUseEnvFallback()) {
      const envAdmin = getEnvAdmin();

      if (
        !envAdmin ||
        normalizedEmail !== envAdmin.email ||
        password !== envAdmin.password
      ) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      admin = {
        email: envAdmin.email,
      };
    } else {
      return res.status(500).json({
        message: "Admin auth is not configured on the server.",
      });
    }

    const token = signAdminToken(admin);

    res.cookie("adminToken", token, getCookieOptions());

    res.json({
      message: "Login successful.",
      email: admin.email,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.json({ message: "Logged out." });
});

router.post("/change-password", protectAdmin, async (req, res) => {
  try {
    if (!hasAuthConfig()) {
      return res.status(500).json({
        message: "Admin auth is not configured on the server.",
      });
    }

    if (!isDatabaseConnected()) {
      return res.status(503).json({
        message: "Password changes are unavailable until database access is working.",
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters.",
      });
    }

    let admin = null;

    try {
      admin = req.adminId
        ? await AdminCredential.findById(req.adminId)
        : await ensureAdminAccount();
    } catch (lookupError) {
      console.error("Admin lookup error during password change:", lookupError.message);
      return res.status(503).json({
        message: "Password changes are unavailable until database access is working.",
      });
    }

    if (!admin) {
      return res.status(503).json({
        message: "Password changes are unavailable until the admin account is stored.",
      });
    }

    const currentPasswordMatches = await bcrypt.compare(
      currentPassword,
      admin.passwordHash
    );

    if (!currentPasswordMatches) {
      return res.status(401).json({
        message: "Current password is incorrect.",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, admin.passwordHash);

    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from the current password.",
      });
    }

    admin.passwordHash = await bcrypt.hash(newPassword, 10);
    await admin.save();

    const token = signAdminToken(admin);
    res.cookie("adminToken", token, getCookieOptions());

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Admin password change error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.get("/me", (req, res) => {
  if (!hasAuthConfig()) {
    return res.status(401).json({ isAuthenticated: false, email: "" });
  }

  const token = req.cookies.adminToken;

  if (!token) {
    return res.status(401).json({ isAuthenticated: false, email: "" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
    if (error || decoded?.role !== "admin") {
      return res.status(401).json({ isAuthenticated: false, email: "" });
    }

    const decodedEmail = normalizeEmail(decoded?.email);

    if (decodedEmail && !decoded?.adminId) {
      return res.json({
        isAuthenticated: true,
        email: decodedEmail,
      });
    }

    if (!isDatabaseConnected()) {
      if (decodedEmail) {
        return res.json({
          isAuthenticated: true,
          email: decodedEmail,
        });
      }

      return res.status(401).json({ isAuthenticated: false, email: "" });
    }

    try {
      const admin = await getAdminFromDecoded(decoded);

      if (admin) {
        return res.json({
          isAuthenticated: true,
          email: admin.email,
        });
      }

      if (decodedEmail) {
        return res.json({
          isAuthenticated: true,
          email: decodedEmail,
        });
      }

      return res.status(401).json({ isAuthenticated: false, email: "" });
    } catch (lookupError) {
      console.error("Admin session lookup error:", lookupError);

      if (decodedEmail) {
        return res.json({
          isAuthenticated: true,
          email: decodedEmail,
        });
      }

      return res.status(500).json({ message: "Server error." });
    }
  });
});

router.get("/bootstrap-status", async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.json({
        hasStoredAdmin: false,
        canUseEnvFallback: canUseEnvFallback(),
        hasEnvAdminConfig: hasEnvAdminConfig(),
        databaseConnected: false,
        formNotificationConfigured: isFormNotificationConfigured(),
      });
    }

    let hasStoredAdmin = false;

    try {
      hasStoredAdmin = Boolean(await AdminCredential.exists({}));
    } catch {
      hasStoredAdmin = false;
    }

    return res.json({
      hasStoredAdmin,
      canUseEnvFallback: canUseEnvFallback(),
      hasEnvAdminConfig: hasEnvAdminConfig(),
      databaseConnected: true,
      formNotificationConfigured: isFormNotificationConfigured(),
    });
  } catch {
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;
