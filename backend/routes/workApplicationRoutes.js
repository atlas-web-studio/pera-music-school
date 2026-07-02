import express from "express";
import WorkApplication from "../models/WorkApplication.js";
import protectAdmin from "../middleware/protectAdmin.js";
import requireDatabase from "../middleware/requireDatabase.js";
import { notifyWorkApplicationSubmitted } from "../services/formNotificationService.js";
import { isDatabaseConnected } from "../config/db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { fullName, email, phone, instruments } = req.body;

    if (!fullName || !email || !phone || !Array.isArray(instruments) || instruments.length === 0) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    const baseApplication = {
      fullName,
      email,
      phone,
      instruments,
    };

    let application = null;
    let storageMode = "email-only";

    if (isDatabaseConnected()) {
      try {
        application = await WorkApplication.create(baseApplication);
        storageMode = "database";
      } catch (databaseError) {
        console.error("Work application database save failed:", databaseError);
      }
    }

    const notificationPayload = application || {
      ...baseApplication,
      status: "NEW",
      createdAt: new Date().toISOString(),
    };

    if (application) {
      void notifyWorkApplicationSubmitted(notificationPayload).catch(
        (notificationError) => {
          console.error(
            "Work application notification email failed:",
            notificationError
          );
        }
      );

      return res.status(201).json({
        message: "Application submitted successfully.",
        application,
        storageMode,
      });
    }

    try {
      await notifyWorkApplicationSubmitted(notificationPayload);
    } catch (notificationError) {
      console.error(
        "Work application notification email failed:",
        notificationError
      );

      return res.status(503).json({
        code: "DATABASE_UNAVAILABLE",
        message:
          "We could not receive your inquiry right now. Please try again shortly or email info@peramusicschool.com.",
      });
    }

    res.status(202).json({
      message:
        "Your inquiry was received and forwarded to our team by email. It may appear in the admin inbox after database access is restored.",
      application: notificationPayload,
      storageMode,
    });
  } catch (error) {
    console.error("Work application error:", error);
    res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
});

router.get("/", protectAdmin, requireDatabase, async (req, res) => {
  try {
    const applications = await WorkApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error("Work applications fetch error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.patch("/:id/status", protectAdmin, requireDatabase, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["NEW", "READ", "ARCHIVED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await WorkApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    console.error("Work application status update error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.delete("/:id", protectAdmin, requireDatabase, async (req, res) => {
  try {
    const deleted = await WorkApplication.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Application not found." });
    }

    res.json({ message: "Application deleted." });
  } catch (error) {
    console.error("Work application delete error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;
