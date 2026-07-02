import jwt from "jsonwebtoken";

export default function protectAdmin(req, res, next) {
  const token = req.cookies.adminToken;

  if (!token) {
    return res.status(401).json({ message: "Not authorized." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden." });
    }

    req.adminId = decoded.adminId || null;
    req.adminRole = decoded.role;

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
