const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const { createNotificationService } = require("../services/notification.service");
const AppError = require("../utils/AppError");
const { SAFE_PATIENT_FIELDS, SAFE_DOCTOR_FIELDS } = require("../utils/selectFields");

exports.addPrescription = async (req, res, next) => {
    try {
        const {
            patientId,
            doctorId,
            appointmentId,
            diagnosis,
            symptoms,
            medicines,
            advice,
            followUpDate,
            notes,
            status
        } = req.body;

        if (!patientId || !doctorId || !appointmentId || !diagnosis || !medicines?.length) {
            throw new AppError("Required fields are missing", 400);
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            throw new AppError("Appointment not found", 404);
        }

        if (appointment.doctor.toString() !== doctorId) {
            throw new AppError(
                "Unauthorized to add prescription for this appointment",
                403
            );
        }

        const existingPrescription = await Prescription.findOne({
            appointment: appointmentId
        });

        if (existingPrescription) {
            throw new AppError(
                "Prescription already exists for this appointment",
                400
            );
        }

        const newPrescription = await Prescription.create({
            patient: patientId,
            doctor: doctorId,
            appointment: appointmentId,
            diagnosis,
            symptoms,
            medicines,
            advice,
            followUpDate,
            notes,
            status: status || "active"
        });

        appointment.status = "completed";
        await appointment.save();

        await createNotificationService({
            recipient: patientId,
            type: "prescriptionAdded",
            appointment: appointment._id,
            data: newPrescription
        })
        await createNotificationService({
            recipient: doctorId,
            type: "prescriptionAdded",
            appointment: appointment._id,
            data: newPrescription
        })

        res.json({
            success: true,
            message: "Prescription added successfully",
            data: newPrescription
        });

    } catch (error) {
        next(error);
    }
};

//for get All Prescription of Role
exports.getPrescriptionByRole = async (req, res, next) => {
    try {
        const { role, id } = req.user;

        let prescriptions;

        if (role === "patient") {
            prescriptions = await Prescription.find({ patient: id })
                .populate({ path: "doctor", select: SAFE_DOCTOR_FIELDS, strictPopulate: false })
                .populate("appointment");
        }

        else if (role === "doctor") {
            prescriptions = await Prescription.find({ doctor: id })
                .populate({ path: "patient", select: SAFE_PATIENT_FIELDS, strictPopulate: false })
                .populate("appointment");
        }

        else if (role === "admin") {
            prescriptions = await Prescription.find({})
                .populate({ path: "Patient", select: SAFE_PATIENT_FIELDS, strictPopulate: false })
                .populate({ path: "doctor", select: SAFE_DOCTOR_FIELDS, strictPopulate: false })
                .populate("appointment");
        }

        else {
            throw new AppError("Unauthorized role", 403);
        }

        if (!prescriptions.length) {
            throw new AppError("No prescriptions found", 404);
        }

        res.json({
            success: true,
            message: "Prescriptions fetched successfully",
            results: prescriptions.length,
            data: prescriptions
        });

    } catch (error) {
        next(error);
    }
};

//ByAppointmentId

exports.getPrescriptionById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const prescription = await Prescription.findOne({ appointment: id })
            .populate({ path: "patient", select: SAFE_PATIENT_FIELDS, strictPopulate: false })
            .populate({ path: "doctor", select: SAFE_DOCTOR_FIELDS, strictPopulate: false })
            .populate("appointment");

        if (!prescription) {
            throw new AppError("Prescription not found", 404);
        }

        res.json({
            success: true,
            message: "Prescription fetched successfully",
            data: prescription
        });

    } catch (error) {
        next(error);
    }
};