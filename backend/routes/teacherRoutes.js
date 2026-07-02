import express from "express";
import Teacher from "../models/Teacher.js";
import upload from "../middleware/upload.js";
import protectAdmin from "../middleware/protectAdmin.js";
import requireDatabase from "../middleware/requireDatabase.js";
import { isDatabaseConnected } from "../config/db.js";

const router = express.Router();

async function fetchTeachersFromDatabase() {
  return Teacher.find().sort({ order: 1, createdAt: 1 }).lean();
}

function respondWithUnavailableTeachers(res) {
  return res.status(503).json({
    code: "DATABASE_UNAVAILABLE",
    message:
      "Teacher profiles are temporarily unavailable while database access is being restored.",
  });
}

router.get("/", async (req, res) => {
  if (!isDatabaseConnected()) {
    return respondWithUnavailableTeachers(res);
  }

  try {
    const teachers = await fetchTeachersFromDatabase();
    res.set("X-Data-Source", "database");
    return res.json(teachers);
  } catch (error) {
    console.error("Teacher fetch error:", error);
    return respondWithUnavailableTeachers(res);
  }
});

router.post(
  "/",
  protectAdmin,
  requireDatabase,
  upload.single("image"),
  async (req, res) => {
    try {
      const payload = { ...req.body };

      if (req.file) {
        payload.imageUrl = req.file.path;
      }

      const lastTeacher = await Teacher.findOne()
        .sort({ order: -1, createdAt: -1 })
        .select("order");

      const lastOrder = Number.isFinite(lastTeacher?.order) ? lastTeacher.order : 0;
      payload.order = lastOrder + 1;

      const teacher = await Teacher.create(payload);
      return res.status(201).json(teacher);
    } catch (error) {
      console.error("Teacher create error:", error);
      return res.status(400).json({ message: "Failed to create teacher" });
    }
  }
);

router.put(
  "/:id",
  protectAdmin,
  requireDatabase,
  upload.single("image"),
  async (req, res) => {
    try {
      const payload = { ...req.body };

      if (req.file) {
        payload.imageUrl = req.file.path;
      }

      const teacher = await Teacher.findByIdAndUpdate(req.params.id, payload, {
        new: true,
      });

      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      return res.json(teacher);
    } catch (error) {
      console.error("Teacher update error:", error);
      return res.status(400).json({ message: "Failed to update teacher" });
    }
  }
);

router.delete("/:id", protectAdmin, requireDatabase, async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    return res.json({ message: "Teacher deleted" });
  } catch {
    return res.status(400).json({ message: "Failed to delete teacher" });
  }
});

export default router;
