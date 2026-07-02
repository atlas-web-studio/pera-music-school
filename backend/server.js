import "./config/loadEnv.js";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { getDatabaseStatus, isDatabaseConnected } from "./config/db.js";
import cookieParser from "cookie-parser";

import workApplicationRoutes from "./routes/workApplicationRoutes.js";
import trialSessionRoutes from "./routes/trialSessionRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import programRoutes from "./routes/programRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";

const app = express();

function splitOrigins(value) {
  if (!value || typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeOrigin(origin) {
  return origin.trim().replace(/\/+$/, "");
}

const allowedOrigins = [
  ...new Set(
    [process.env.CLIENT_URL, ...splitOrigins(process.env.CLIENT_URLS)]
      .filter(Boolean)
      .map(normalizeOrigin)
  ),
];

void connectDB();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(normalizeOrigin(origin))) {
        return callback(null, true);
      }

      console.warn(`Blocked CORS request from origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/admin/auth", adminAuthRoutes);

app.use("/api/programs", programRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/work-applications", workApplicationRoutes);
app.use("/api/trial-sessions", trialSessionRoutes);

app.get("/api/health", (req, res) => {
  const database = getDatabaseStatus();
  const isHealthy = isDatabaseConnected();

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    database,
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
