const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Hospital = require("../models/Hospital");

const sanitizeHospitalPublic = (hospital) => ({
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
  createdAt:        hospital.createdAt,
});

exports.getHospitals = async (req, res) => {
  try {
    const { page = 1, limit = 10, city, verified, search } = req.query;

    const filter = {};
    if (city)                   filter["address.city"] = new RegExp(city, "i");
    if (verified !== undefined) filter.isVerified      = verified === "true";
    if (search)                 filter.name            = new RegExp(search, "i");

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
      hospitals: hospitals.map(sanitizeHospitalPublic),
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

    const hospital = await Hospital.findById(id).populate("doctors");
    if (!hospital)
      return res.status(404).json({ success: false, message: "Hospital not found" });

    res.json({ success: true, hospital: sanitizeHospitalPublic(hospital) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNearbyHospitals = async (req, res) => {
  try {
    const { lng, lat, distance = 5000 } = req.query;

    if (!lng || !lat)
      return res.status(400).json({ success: false, message: "lng and lat are required" });

    const hospitals = await Hospital.find({
      "address.location": {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(distance),
        },
      },
    }).populate("doctors");

    res.json({ success: true, hospitals: hospitals.map(sanitizeHospitalPublic) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchHospitals = async (req, res) => {
  try {
    const { q = "" } = req.query;

    const filter = q.trim()
      ? {
          $or: [
            { name:            { $regex: q, $options: "i" } },
            { "address.city":  { $regex: q, $options: "i" } },
            { "address.state": { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const hospitals = await Hospital.find(filter)
      .select("name email phone address specialties isVerified isActive logo doctors beds")
      .lean();

    res.json({ success: true, hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
