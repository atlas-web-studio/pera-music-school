import express from "express";
import TrialSessionRequest from "../models/TrialSessionRequest.js";
import protectAdmin from "../middleware/protectAdmin.js";
import requireDatabase from "../middleware/requireDatabase.js";
import { notifyTrialSessionSubmitted } from "../services/formNotificationService.js";
import { isDatabaseConnected } from "../config/db.js";
import { formatTimeTo12Hour } from "../utils/time.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      studentName,
      dateOfBirth,
      studentAge,
      grade,
      school,
      parentName,
      email,
      phone,
      address,
      trialDate,
      teacher,
      instrument,
      lessonLength,
      lessonTime: rawLessonTime,
      hasPreviousLessons,
      previousInstruments,
      previousLessonYears,
      previousTeacherSchool,
      musicReadingLevel,
      practicesAnotherInstrument,
      participation,
      programInterests,
      experienceLevel,
      availability,
      goals,
    } = req.body;

    const isLegacySubmission =
      Array.isArray(programInterests) ||
      Boolean(experienceLevel) ||
      Boolean(availability) ||
      Boolean(goals);

    const hasRequiredNewFields = studentName && email && phone && instrument;
    const hasRequiredLegacyFields =
      studentName &&
      studentAge &&
      email &&
      phone &&
      Array.isArray(programInterests) &&
      programInterests.length > 0 &&
      experienceLevel &&
      availability;

    if (!hasRequiredNewFields && !hasRequiredLegacyFields) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    const baseRequest = {
      studentName,
      dateOfBirth,
      studentAge,
      grade,
      school,
      parentName,
      email,
      phone,
      address,
      trialDate,
      teacher,
      instrument,
      lessonLength,
      lessonTime: formatTimeTo12Hour(rawLessonTime),
      hasPreviousLessons,
      previousInstruments,
      previousLessonYears,
      previousTeacherSchool,
      musicReadingLevel,
      practicesAnotherInstrument,
      participation: Array.isArray(participation) ? participation : [],
      programInterests:
        isLegacySubmission && Array.isArray(programInterests) ? programInterests : [],
      experienceLevel: isLegacySubmission ? experienceLevel : "",
      availability: isLegacySubmission ? availability : "",
      goals: isLegacySubmission ? goals : "",
    };

    let trialSessionRequest = null;
    let storageMode = "email-only";

    if (isDatabaseConnected()) {
      try {
        trialSessionRequest = await TrialSessionRequest.create(baseRequest);
        storageMode = "database";
      } catch (databaseError) {
        console.error("Trial session database save failed:", databaseError);
      }
    }

    const notificationPayload = trialSessionRequest || {
      ...baseRequest,
      status: "NEW",
      createdAt: new Date().toISOString(),
    };

    if (trialSessionRequest) {
      void notifyTrialSessionSubmitted(notificationPayload).catch(
        (notificationError) => {
          console.error(
            "Trial session notification email failed:",
            notificationError
          );
        }
      );

      return res.status(201).json({
        message: "Trial session request submitted successfully.",
        trialSessionRequest,
        storageMode,
      });
    }

    try {
      await notifyTrialSessionSubmitted(notificationPayload);
    } catch (notificationError) {
      console.error(
        "Trial session notification email failed:",
        notificationError
      );

      return res.status(503).json({
        code: "DATABASE_UNAVAILABLE",
        message:
          "We could not receive your trial request right now. Please try again shortly or email info@peramusicschool.com.",
      });
    }

    res.status(202).json({
      message:
        "Your trial request was received and forwarded to our team by email. It may appear in the admin inbox after database access is restored.",
      trialSessionRequest: notificationPayload,
      storageMode,
    });
  } catch (error) {
    console.error("Trial session request error:", error);
    res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
});

router.get("/", protectAdmin, requireDatabase, async (req, res) => {
  try {
    const requests = await TrialSessionRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("Trial session fetch error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.patch("/:id/status", protectAdmin, requireDatabase, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["NEW", "READ", "ARCHIVED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const updated = await TrialSessionRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Trial session request not found." });
    }

    res.json(updated);
  } catch (error) {
    console.error("Trial session status update error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.delete("/:id", protectAdmin, requireDatabase, async (req, res) => {
  try {
    const deleted = await TrialSessionRequest.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Trial session request not found." });
    }

    res.json({ message: "Trial session request deleted." });
  } catch (error) {
    console.error("Trial session delete error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;
