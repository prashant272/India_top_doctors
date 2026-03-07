const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Provider = require("../models/Provider");
const Hospital = require("../models/Hospital");

const generateToken = (id, email) =>
  jwt.sign({ id, email, role: "provider" }, process.env.SECRET, { expiresIn: "7d" });

const generateRefreshToken = (id) =>
  jwt.sign({ id, role: "provider" }, process.env.REFRESH_SECRET || process.env.SECRET, { expiresIn: "30d" });

const sanitizeProvider = (provider) => ({
  _id:       provider._id,
  name:      provider.name,
  email:     provider.email,
  phone:     provider.phone,
  role:      provider.role,
  isActive:  provider.isActive,
  createdAt: provider.createdAt,
});

const sanitizeHospital = (hospital) => ({
  _id:              hospital._id,
  name:             hospital.name,
  email:            hospital.email,
  phone:            hospital.phone,
  alternatePhone:   hospital.alternatePhone,
  website:          hospital.website,
  description:      hospital.description,
  emergencyContact: hospital.emergencyContact,
  established:      hospital.established,
  beds:             hospital.beds,
  accreditation:    hospital.accreditation,
  contactPerson:    hospital.contactPerson,
  address:          hospital.address,
  logo:             hospital.logo,
  images:           hospital.images,
  specialties:      hospital.specialties,
  departments:      hospital.departments,
  facilities:       hospital.facilities,
  doctors:          hospital.doctors,
  isActive:         hospital.isActive,
  isVerified:       hospital.isVerified,
  createdBy:        hospital.createdBy,
  createdAt:        hospital.createdAt,
});

exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Name, email and password are required" });

    const existing = await Provider.findOne({ email });
    if (existing)
      return res.status(409).json({ success: false, message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const provider = await Provider.create({ name, email, password: hashedPassword, phone });

    const token        = generateToken(provider._id, provider.email);
    const refreshToken = generateRefreshToken(provider._id);

    res.status(201).json({
      success: true,
      message: "Provider registered successfully",
      token,
      refreshToken,
      provider: sanitizeProvider(provider),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const provider = await Provider.findOne({ email }).select("+password");
    if (!provider)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token        = generateToken(provider._id, provider.email);
    const refreshToken = generateRefreshToken(provider._id);

    res.status(200).json({
      success: true,
      message: "Signed in successfully",
      token,
      refreshToken,
      provider: sanitizeProvider(provider),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const provider = await Provider.findById(req.provider._id);
    if (!provider)
      return res.status(404).json({ success: false, message: "Provider not found" });

    res.json({ success: true, provider: sanitizeProvider(provider) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const FORBIDDEN = ["password", "email", "role", "isActive"];
    FORBIDDEN.forEach((f) => delete req.body[f]);

    if (Object.keys(req.body).length === 0)
      return res.status(400).json({ success: false, message: "No valid fields to update" });

    const provider = await Provider.findByIdAndUpdate(
      req.provider._id,
      { $set: req.body },
      { new: true, runValidators: false }
    );

    if (!provider)
      return res.status(404).json({ success: false, message: "Provider not found" });

    res.json({ success: true, message: "Profile updated", provider: sanitizeProvider(provider) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createHospital = async (req, res) => {
  try {
    const {
      name, email, password,
      city, state, pincode, street, address,
      contactPerson,
      ...rest
    } = req.body;

    if (!name || !email)
      return res.status(400).json({ success: false, message: "Name and email are required" });

    const existing = await Hospital.findOne({ email });
    if (existing)
      return res.status(409).json({ success: false, message: "Email already registered" });

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : await bcrypt.hash("defaultPass@123", 10);

    const hospital = await Hospital.create({
      name,
      email,
      password: hashedPassword,
      ...rest,
      ...(contactPerson && { contactPerson }),
      address: {
        street: street || address,
        city,
        state,
        pincode,
        country: "India",
      },
      createdBy: req.provider.email,
    });

    res.status(201).json({ success: true, message: "Hospital created", hospital: sanitizeHospital(hospital) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyHospitals = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const filter = { createdBy: req.provider.email };

    const hospitals = await Hospital.find(filter)
      .populate("doctors")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Hospital.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: Number(page),
      hospitals: hospitals.map(sanitizeHospital),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid ID" });

    const hospital = await Hospital.findOne({ _id: id, createdBy: req.provider.email }).populate("doctors");
    if (!hospital)
      return res.status(404).json({ success: false, message: "Hospital not found or not yours" });

    res.json({ success: true, hospital: sanitizeHospital(hospital) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateHospital = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid ID" });

    const FORBIDDEN = ["password", "email", "createdBy"];
    FORBIDDEN.forEach((f) => delete req.body[f]);

    const { city, state, pincode, street, address, name, contactPerson, ...rest } = req.body;

    const updateData = { ...rest };

    if (name !== undefined && name !== null) {
      const trimmed = name.toString().trim();
      if (!trimmed)
        return res.status(400).json({ success: false, message: "Name cannot be empty" });
      updateData.name = trimmed;
    }

    if (city    !== undefined) updateData["address.city"]    = city;
    if (state   !== undefined) updateData["address.state"]   = state;
    if (pincode !== undefined) updateData["address.pincode"] = pincode;
    if (street  !== undefined) updateData["address.street"]  = street;
    else if (address !== undefined) updateData["address.street"] = address;

    if (contactPerson && typeof contactPerson === "object") {
      if (contactPerson.name        !== undefined) updateData["contactPerson.name"]           = contactPerson.name;
      if (contactPerson.email       !== undefined) updateData["contactPerson.email"]          = contactPerson.email;
      if (contactPerson.phone       !== undefined) updateData["contactPerson.phone"]          = contactPerson.phone;
      if (contactPerson.alternatePhone !== undefined) updateData["contactPerson.alternatePhone"] = contactPerson.alternatePhone;
      if (contactPerson.designation !== undefined) updateData["contactPerson.designation"]   = contactPerson.designation;
    }

    const hospital = await Hospital.findOneAndUpdate(
      { _id: id, createdBy: req.provider.email },
      { $set: updateData },
      { new: true, runValidators: false }
    ).populate("doctors");

    if (!hospital)
      return res.status(404).json({ success: false, message: "Hospital not found or not yours" });

    res.json({ success: true, message: "Hospital updated", hospital: sanitizeHospital(hospital) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid ID" });

    const hospital = await Hospital.findOneAndDelete({ _id: id, createdBy: req.provider.email });
    if (!hospital)
      return res.status(404).json({ success: false, message: "Hospital not found or not yours" });

    res.json({ success: true, message: "Hospital deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid ID" });

    const hospital = await Hospital.findOne({ _id: id, createdBy: req.provider.email });
    if (!hospital)
      return res.status(404).json({ success: false, message: "Hospital not found or not yours" });

    hospital.isActive = !hospital.isActive;
    await hospital.save();

    res.json({
      success: true,
      message: `Hospital ${hospital.isActive ? "activated" : "deactivated"}`,
      hospital: sanitizeHospital(hospital),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addDoctor = async (req, res) => {
  try {
    const { hospitalId, doctorId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(hospitalId) || !mongoose.Types.ObjectId.isValid(doctorId))
      return res.status(400).json({ success: false, message: "Invalid hospitalId or doctorId" });

    const hospital = await Hospital.findOneAndUpdate(
      { _id: hospitalId, createdBy: req.provider.email },
      { $addToSet: { doctors: doctorId } },
      { new: true }
    ).populate("doctors");

    if (!hospital)
      return res.status(404).json({ success: false, message: "Hospital not found or not yours" });

    res.json({ success: true, message: "Doctor added", hospital: sanitizeHospital(hospital) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeDoctor = async (req, res) => {
  try {
    const { hospitalId, doctorId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(hospitalId) || !mongoose.Types.ObjectId.isValid(doctorId))
      return res.status(400).json({ success: false, message: "Invalid hospitalId or doctorId" });

    const hospital = await Hospital.findOneAndUpdate(
      { _id: hospitalId, createdBy: req.provider.email },
      { $pull: { doctors: doctorId } },
      { new: true }
    ).populate("doctors");

    if (!hospital)
      return res.status(404).json({ success: false, message: "Hospital not found or not yours" });

    res.json({ success: true, message: "Doctor removed", hospital: sanitizeHospital(hospital) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
