import { isDatabaseConnected } from "../config/db.js";

export default function requireDatabase(req, res, next) {
  if (isDatabaseConnected()) {
    return next();
  }

  return res.status(503).json({
    code: "DATABASE_UNAVAILABLE",
    message:
      "MongoDB is currently unavailable. Content will reappear once Atlas access is restored.",
  });
}
