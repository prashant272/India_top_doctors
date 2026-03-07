const jwt = require("jsonwebtoken");
const Hospital = require("../models/Hospital");

exports.protectHospital = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1]
    } else if (req.cookies?.token) {
      token = req.cookies.token
    }

    if (!token)
      return res.status(401).json({ success: false, message: "Not authorized, no token" })

    const decoded = jwt.verify(token, process.env.SECRET)

    if (decoded.role !== "hospital")
      return res.status(403).json({ success: false, message: "Access denied. Hospital accounts only." })

    const hospital = await Hospital.findById(decoded.id).select("-password")

    if (!hospital)
      return res.status(401).json({ success: false, message: "Hospital account not found" })

    if (!hospital.isActive)
      return res.status(403).json({ success: false, message: "Hospital account is deactivated" })

    req.hospital = hospital
    next()
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ success: false, message: "Token expired, please sign in again" })
    if (err.name === "JsonWebTokenError")
      return res.status(401).json({ success: false, message: "Invalid token" })
    res.status(500).json({ success: false, message: err.message })
  }
}
