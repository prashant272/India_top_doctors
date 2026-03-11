const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        Patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },
        appointmentDate: {
            type: Date,
            required: true,
        },
        timeSlot: {
            start: { type: String, required: true },
            end: { type: String, required: true },
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "in_progress", "completed", "cancelled", "missed"],
            default: "pending",
        },
        doctorJoinStatus: {
            type: String,
            enum: ["not_joined", "joined", "left"],
            default: "not_joined",
        },
        patientJoinStatus: {
            type: String,
            enum: ["not_joined", "joined", "left"],
            default: "not_joined",
        },
        callStartedAt: { type: Date },
        callEndedAt: { type: Date },
        callDuration: { type: Number },
        consultationType: {
            type: String,
            enum: ["video", "in-person"],
            default: "video",
        },
        meetingLink: String,
        symptoms: String,
        notes: String,
        isPaid: {
            type: Boolean,
            default: false,
        },
        amount: {
            type: Number,
            default: 0,
        },
        lastTxnId: {
            type: String,
        },
    },
    { timestamps: true }
);

appointmentSchema.index(
    {
        Patient: 1,
        doctor: 1,
        appointmentDate: 1,
        "timeSlot.start": 1,
    },
    { unique: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
