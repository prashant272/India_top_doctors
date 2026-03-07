const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../../models/Admin");
const permissionsByRole = require("../../config/permissions");
const AppError = require("../../utils/AppError");

const ADMIN_SIGNUP_SECRET = process.env.ADMIN_SIGNUP_SECRET;
const ADMIN_SIGNIN_SECRET = process.env.ADMIN_SIGNIN_SECRET;

exports.adminSignUp = async (req, res, next) => {
  try {
    const { email, password, role, secretKey } = req.body;

    if (!ADMIN_SIGNUP_SECRET) {
      return next(new AppError("Server configuration error", 500));
    }

    if (!secretKey || secretKey !== ADMIN_SIGNUP_SECRET) {
      return next(new AppError("Invalid admin signup secret key", 401));
    }

    if (!email || !password) {
      return next(new AppError("Email and password are required", 400));
    }

    if (password.length < 6) {
      return next(new AppError("Password must be at least 6 characters", 400));
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return next(new AppError("Admin already exists", 409));
    }

    const adminRole = role || "ADMIN";
    const permissions =
      permissionsByRole[adminRole] || permissionsByRole["ADMIN"];

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      ...req.body,
      password: hashedPassword,
      role: adminRole,
      permissions,
      isActive: true
    });

    admin.password = undefined;

    res.status(201).json({
      success: true,
      admin,
      msg: "Admin account created successfully"
    });

  } catch (error) {
    next(error);
  }
};

exports.adminSignIn = async (req, res, next) => {
  try {
    const { email, password, role, secretKey } = req.body;

    if (!email || !password) {
      return next(new AppError("Email and password are required", 400));
    }

    // if (!ADMIN_SIGNIN_SECRET) {
    //   return next(new AppError("Server configuration error", 500));
    // }

    // if (!secretKey || secretKey !== ADMIN_SIGNIN_SECRET) {
    //   return next(new AppError("Invalid admin signin secret key", 401));
    // }

    const query = { email };
    if (role) {
      query.role = role;
    }

    const admin = await Admin.findOne(query).select("+password");

    if (!admin) {
      return next(new AppError("Admin not found", 404));
    }

    if (!admin.isActive) {
      return next(new AppError("Admin account is deactivated", 403));
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return next(new AppError("Invalid credentials", 401));
    }

    const token = jwt.sign(
      {
        userId: admin._id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      },
      process.env.SECRET,
      { expiresIn: "24h" }
    );

    const refreshToken = jwt.sign(
      { userId: admin._id, role: admin.role },
      process.env.REFRESH_SECRET || process.env.SECRET,
      { expiresIn: "7d" }
    );

    admin.password = undefined;

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      adminId: admin._id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      msg: "Admin login successful"
    });

  } catch (error) {
    next(error);
  }
};