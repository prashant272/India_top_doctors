const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const { SAFE_PATIENT_FIELDS, SAFE_DOCTOR_FIELDS } = require('../utils/selectFields');
const { createNotificationService } = require('../services/notification.service');

exports.createAppointment = async (req, res) => {
    try {
        const {
            patientId, doctorId, appointmentDate, timeSlot,
            status, consultationType, meetingLink, isPaid, amount, symptoms, notes,
        } = req.body;

        if (!patientId || !doctorId || !appointmentDate || !timeSlot?.start || !timeSlot?.end) {
            return res.status(400).json({
                success: false,
                message: 'patientId, doctorId, appointmentDate and timeSlot are required',
            });
        }

        const existing = await Appointment.findOne({
            doctor: doctorId,
            appointmentDate: new Date(appointmentDate),
            'timeSlot.start': timeSlot.start,
        });

        if (existing) {
            return res.status(409).json({ success: false, message: 'This time slot is already booked' });
        }

        const appointment = new Appointment({
            Patient: patientId,
            doctor: doctorId,
            appointmentDate,
            timeSlot,
            status: status || 'pending',
            consultationType: consultationType || 'video',
            meetingLink,
            isPaid: isPaid || false,
            amount: amount || 0,
            symptoms,
            notes,
        });

        await appointment.save();

        const populated = await Appointment.findById(appointment._id)
            .populate({ path: 'Patient', select: SAFE_PATIENT_FIELDS, strictPopulate: false })
            .populate({ path: 'doctor', select: SAFE_DOCTOR_FIELDS, strictPopulate: false });

        await createNotificationService({
            recipient: doctorId,
            type: 'newMessage',
            appointment: populated._id,
            data: populated,
        });

        return res.status(201).json({
            success: true,
            message: 'Appointment created successfully',
            data: populated,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'This time slot is already booked' });
        }
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

exports.getAllAppointments = async (req, res) => {
    try {
        const { role, id } = req.query;

        if (!role || !id) {
            return res.status(400).json({ success: false, message: 'Role and ID are required' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }

        let query;

        if (role === 'patient') {
            query = Appointment.find({ Patient: new mongoose.Types.ObjectId(id) })
                .populate({ path: 'Patient', select: SAFE_PATIENT_FIELDS, strictPopulate: false })
                .populate({ path: 'doctor', select: SAFE_DOCTOR_FIELDS, strictPopulate: false })
                .sort({ appointmentDate: -1 });
        } else if (role === 'doctor') {
            query = Appointment.find({ doctor: new mongoose.Types.ObjectId(id) })
                .populate({ path: 'Patient', select: SAFE_PATIENT_FIELDS, strictPopulate: false })
                .populate({ path: 'doctor', select: SAFE_DOCTOR_FIELDS, strictPopulate: false })
                .sort({ appointmentDate: -1 });
        } else if (role === 'admin') {
            query = Appointment.find({})
                .populate({ path: 'Patient', select: SAFE_PATIENT_FIELDS, strictPopulate: false })
                .populate({ path: 'doctor', select: SAFE_DOCTOR_FIELDS, strictPopulate: false })
                .sort({ appointmentDate: -1 });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const appointments = await query;

        return res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

exports.getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
        }

        const appointment = await Appointment.findById(id)
            .populate({ path: 'Patient', select: SAFE_PATIENT_FIELDS, strictPopulate: false })
            .populate({ path: 'doctor', select: SAFE_DOCTOR_FIELDS, strictPopulate: false });

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        return res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

exports.updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
        }

        const updatedfor = req.body.doctor;

        const allowedUpdates = [
            'appointmentDate', 'timeSlot', 'status', 'consultationType',
            'meetingLink', 'isPaid', 'amount', 'symptoms', 'notes',
            'rescheduleReason', 'doctorJoinStatus', 'patientJoinStatus',
        ];

        const updates = {};
        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        )
            .populate({ path: 'Patient', select: SAFE_PATIENT_FIELDS, strictPopulate: false })
            .populate({ path: 'doctor', select: SAFE_DOCTOR_FIELDS, strictPopulate: false });

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        const isReschedule = req.body.appointmentDate || req.body.timeSlot;
        const notificationType = isReschedule ? 'rescheduled' : updates.status;

        const VALID_NOTIFICATION_TYPES = [
            'newMessage', 'confirmed', 'cancelled', 'completed', 'prescriptionAdded', 'rescheduled',
        ];

        if (VALID_NOTIFICATION_TYPES.includes(notificationType)) {
            await createNotificationService({
                recipient: updatedfor,
                type: notificationType,
                appointment: appointment._id,
                data: appointment,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Appointment updated successfully',
            data: appointment,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'This time slot is already booked' });
        }
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

exports.confirmAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
        }

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        if (appointment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot confirm an appointment with status '${appointment.status}'`,
            });
        }

        appointment.status = 'confirmed';
        await appointment.save();

        const populated = await Appointment.findById(id)
            .populate({ path: 'Patient', select: SAFE_PATIENT_FIELDS, strictPopulate: false })
            .populate({ path: 'doctor', select: SAFE_DOCTOR_FIELDS, strictPopulate: false });

        await createNotificationService({
            recipient: appointment.Patient,
            type: 'confirmed',
            appointment: populated._id,
            data: populated,
        });

        return res.status(200).json({
            success: true,
            message: 'Appointment confirmed successfully',
            data: populated,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

exports.cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
        }

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        if (['completed', 'cancelled'].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel an appointment with status '${appointment.status}'`,
            });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        const populated = await Appointment.findById(id)
            .populate({ path: 'Patient', select: SAFE_PATIENT_FIELDS, strictPopulate: false })
            .populate({ path: 'doctor', select: SAFE_DOCTOR_FIELDS, strictPopulate: false });

        await createNotificationService({
            recipient: appointment.Patient,
            type: 'cancelled',
            appointment: populated._id,
            data: populated,
        });

        return res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully',
            data: populated,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

exports.joinCall = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
        }

        if (!['doctor', 'patient'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Role must be doctor or patient' });
        }

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        if (!['confirmed', 'in_progress'].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                message: 'Appointment must be confirmed before joining',
            });
        }

        const updates = {};

        if (role === 'doctor') {
            updates.doctorJoinStatus = 'joined';
        } else {
            updates.patientJoinStatus = 'joined';
        }

        const doctorJoined = role === 'doctor' ? true : appointment.doctorJoinStatus === 'joined';
        const patientJoined = role === 'patient' ? true : appointment.patientJoinStatus === 'joined';

        if (doctorJoined && patientJoined) {
            updates.status = 'in_progress';
            updates.callStartedAt = new Date();
        }

        const updated = await Appointment.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        )
            .populate({ path: 'Patient', select: SAFE_PATIENT_FIELDS, strictPopulate: false })
            .populate({ path: 'doctor', select: SAFE_DOCTOR_FIELDS, strictPopulate: false });

        return res.status(200).json({
            success: true,
            message: `${role} joined the call`,
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

exports.leaveCall = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
        }

        if (!['doctor', 'patient'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Role must be doctor or patient' });
        }

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        const updates = {};

        if (role === 'doctor') {
            updates.doctorJoinStatus = 'left';
        } else {
            updates.patientJoinStatus = 'left';
        }

        const doctorLeft = role === 'doctor' ? true : appointment.doctorJoinStatus === 'left';
        const patientLeft = role === 'patient' ? true : appointment.patientJoinStatus === 'left';

        if (doctorLeft || patientLeft) {
            updates.status = 'completed';
            updates.callEndedAt = new Date();

            if (appointment.callStartedAt) {
                const durationMs = new Date() - new Date(appointment.callStartedAt);
                updates.callDuration = Math.floor(durationMs / 1000);
            }
        }

        const updated = await Appointment.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        )
            .populate({ path: 'Patient', select: SAFE_PATIENT_FIELDS, strictPopulate: false })
            .populate({ path: 'doctor', select: SAFE_DOCTOR_FIELDS, strictPopulate: false });

        if (updates.status === 'completed') {
            await createNotificationService({
                recipient: updated.Patient,
                type: 'completed',
                appointment: updated._id,
                data: updated,
            });
        }

        return res.status(200).json({
            success: true,
            message: `${role} left the call`,
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
        }

        const appointment = await Appointment.findByIdAndDelete(id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        return res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};
