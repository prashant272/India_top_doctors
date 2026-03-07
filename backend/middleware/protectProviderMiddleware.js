const jwt = require("jsonwebtoken");
const Provider = require("../models/Provider");

exports.protectProvider = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ success: false, message: "No token provided" });

  try {
    const token   = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET);

    if (decoded.role !== "provider")
      return res.status(403).json({ success: false, message: "Access denied. Provider token required" });

    const provider = await Provider.findById(decoded.id).select("-password");

    if (!provider)
      return res.status(401).json({ success: false, message: "Provider not found" });

    if (!provider.isActive)
      return res.status(403).json({ success: false, message: "Provider account is deactivated" });

    req.provider = provider;
    req.user     = { id: provider._id, email: provider.email, role: "provider" };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ success: false, message: "Token expired. Please sign in again" });

    if (err.name === "JsonWebTokenError")
      return res.status(401).json({ success: false, message: "Invalid token" });

    res.status(500).json({ success: false, message: err.message });
  }
};
