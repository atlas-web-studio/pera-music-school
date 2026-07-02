import express from "express";
import Program from "../models/Program.js";
import upload from "../middleware/upload.js";
import protectAdmin from "../middleware/protectAdmin.js";
import requireDatabase from "../middleware/requireDatabase.js";
import { isDatabaseConnected } from "../config/db.js";
import {
  readCachedCollection,
  writeCachedCollection,
} from "../services/contentCacheService.js";

const router = express.Router();
const CACHE_KEY = "programs";

async function fetchProgramsFromDatabase() {
  return Program.find().sort({ order: 1, createdAt: 1 }).lean();
}

async function refreshProgramsCache() {
  const programs = await fetchProgramsFromDatabase();
  await writeCachedCollection(CACHE_KEY, programs);
  return programs;
}

async function respondWithCachedPrograms(res) {
  const cacheEntry = await readCachedCollection(CACHE_KEY);

  if (cacheEntry.found) {
    res.set("X-Data-Source", "cache");

    if (cacheEntry.updatedAt) {
      res.set("X-Cache-Updated-At", cacheEntry.updatedAt);
    }

    return res.json(cacheEntry.items);
  }

  return res.status(503).json({
    code: "DATABASE_UNAVAILABLE",
    message:
      "Programs are temporarily unavailable while database access is being restored.",
  });
}

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

      const lastProgram = await Program.findOne()
        .sort({ order: -1, createdAt: -1 })
        .select("order");

      const lastOrder = Number.isFinite(lastProgram?.order)
        ? lastProgram.order
        : 0;

      payload.order = lastOrder + 1;

      const program = await Program.create(payload);

      await refreshProgramsCache().catch((cacheError) => {
        console.error("Program cache refresh error:", cacheError);
      });

      res.status(201).json(program);
    } catch (error) {
      console.error("Program create error:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);

router.get("/", async (req, res) => {
  if (!isDatabaseConnected()) {
    return respondWithCachedPrograms(res);
  }

  try {
    const programs = await refreshProgramsCache();
    res.set("X-Data-Source", "database");
    return res.json(programs);
  } catch (error) {
    console.error("Program fetch error:", error);
    return respondWithCachedPrograms(res);
  }
});

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

      const program = await Program.findByIdAndUpdate(req.params.id, payload, {
        new: true,
      });

      if (!program) {
        return res.status(404).json({ message: "Program not found." });
      }

      await refreshProgramsCache().catch((cacheError) => {
        console.error("Program cache refresh error:", cacheError);
      });

      return res.json(program);
    } catch (error) {
      console.error("Program update error:", error);
      return res.status(500).json({ message: "Server error." });
    }
  }
);

router.delete("/:id", protectAdmin, requireDatabase, async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);

    if (!program) {
      return res.status(404).json({ message: "Program not found." });
    }

    await refreshProgramsCache().catch((cacheError) => {
      console.error("Program cache refresh error:", cacheError);
    });

    return res.json({ message: "Program deleted." });
  } catch (error) {
    console.error("Program delete error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;
