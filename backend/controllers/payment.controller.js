const { generateHash } = require('../utils/payu');
const Appointment = require('../models/Appointment');

exports.initiatePayment = async (req, res) => {
    console.log('[initiatePayment] Request Body:', JSON.stringify(req.body, null, 2));
    try {
        const { appointmentData } = req.body;
        if (!appointmentData) {
            return res.status(400).json({ success: false, message: "Missing appointmentData" });
        }
        const {
            amount,
            patientId,
            doctorId,
            appointmentDate,
            timeSlot,
            consultationType,
            symptoms,
            notes,
            firstname,
            email,
            productinfo
        } = appointmentData;

        // 1. Create or Update Appointment in 'pending' state
        const appointmentDataToSave = {
            Patient: patientId,
            doctor: doctorId,
            appointmentDate: new Date(appointmentDate),
            timeSlot,
            status: 'pending',
            consultationType: consultationType || 'video',
            isPaid: false,
            amount: amount,
            symptoms,
            notes,
        };

        const appointment = await Appointment.findOneAndUpdate(
            {
                Patient: patientId,
                doctor: doctorId,
                appointmentDate: new Date(appointmentDate),
                'timeSlot.start': timeSlot.start
            },
            appointmentDataToSave,
            { new: true, upsert: true }
        );

        // 2. Load Fresh Credentials
        const PAYU_KEY = process.env.PAYU_MERCHANT_KEY;
        const PAYU_SALT = process.env.PAYU_SALT;

        const appointmentId = appointment._id.toString();
        // Standardize txnid generation
        const safeTxnid = "T" + Date.now().toString() + Math.floor(Math.random() * 1000).toString();

        const formattedAmount = Number(amount).toFixed(2);

        // Save the generated txnid to the appointment for verification
        appointment.lastTxnId = safeTxnid;
        await appointment.save();

        // Sanitize strings strictly to match PayU expected format
        const safeFirstname = (firstname || 'Patient').split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const safeProductInfo = "Appointment"; 
        const safeEmail = (email || 'patient@example.com').trim().toLowerCase();

        console.log(`[PayU FINAL SYNC] key=${PAYU_KEY}, salt=${PAYU_SALT ? PAYU_SALT.substring(0, 4) : 'MISSING'}..., txnid=${safeTxnid}, amount=${formattedAmount}, productinfo=${safeProductInfo}, firstname=${safeFirstname}, email=${safeEmail}`);

        const hash = generateHash({
            key: PAYU_KEY,
            txnid: safeTxnid,
            amount: formattedAmount,
            productinfo: safeProductInfo,
            firstname: safeFirstname,
            email: safeEmail,
            udf1: "",
            udf2: "",
            udf3: "",
            udf4: "",
            udf5: ""
        }, PAYU_SALT);

        const responseData = {
            success: true,
            hash,
            merchantKey: PAYU_KEY,
            txnid: safeTxnid,
            appointmentId: appointmentId,
            amount: formattedAmount,
            productinfo: safeProductInfo,
            firstname: safeFirstname,
            email: safeEmail,
            phone: (appointmentData && appointmentData.phone) ? appointmentData.phone : "9999999999"
        };

        return res.status(200).json(responseData);
    } catch (error) {
        console.error('CRITICAL: initiatePayment Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    console.log('[verifyPayment] PayU Response Body:', JSON.stringify(req.body, null, 2));
    try {
        const { status, txnid, amount, productinfo, firstname, email } = req.body;

        const appointment = await Appointment.findOne({ lastTxnId: txnid });

        if (!appointment) {
            console.error(`CRITICAL: Appointment not found for txnid: ${txnid}`);
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient/payment/failure?txnid=${txnid}`);
        }

        if (status === 'success') {
            console.log(`[verifyPayment] Payment SUCCESS for txnid: ${txnid}. Updating appointment.`);
            appointment.isPaid = true;
            appointment.status = 'confirmed';
            await appointment.save();

            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient/MyAppointments?status=success&id=${appointment._id}`);
        } else {
            console.log(`[verifyPayment] Payment FAILED/CANCELLED for txnid: ${txnid}. Status: ${status}`);
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient/payment/failure?txnid=${appointment._id}&status=${status}`);
        }
    } catch (error) {
        console.error('CRITICAL: verifyPayment Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
