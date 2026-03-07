const { transporter } = require('../config/nodemailer');
const OtpModel = require('../models/Otp');


exports.generateAndSendOTP = async (email, name = 'User') => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OtpModel.findOneAndUpdate(
    { email },
    { otp, expiresAt, isVerified: false, createdAt: new Date() },
    { upsert: true, new: true }
  );

  await transporter.sendMail({
    from: "noreply@globalhealthcareawards.com",
    to: email,
    subject: 'DocCare – Email Verification OTP',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#0d9488;margin-bottom:8px;">Verify your Email</h2>
        <p style="color:#374151;">Hi <strong>${name}</strong>, use the OTP below to verify your email address:</p>
        <div style="margin:24px 0;padding:20px;background:#fff;border-radius:10px;text-align:center;border:2px solid #0d9488;">
          <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#0d9488;">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:13px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
    `,
  });
};

exports.verifyOTP = async (email, otp) => {
  const record = await OtpModel.findOne({ email });

  if (!record) return { valid: false, msg: 'OTP not found or already used' };

  if (new Date() > new Date(record.expiresAt)) {
    await OtpModel.deleteOne({ email });
    return { valid: false, msg: 'OTP has expired' };
  }

  if (record.otp !== otp) return { valid: false, msg: 'Invalid OTP' };

  await OtpModel.findOneAndUpdate({ email }, { isVerified: true });
  return { valid: true };
};

exports.checkVerified = async (email) => {
  const record = await OtpModel.findOne({ email });

  if (!record) return { verified: false, msg: 'OTP session not found. Please verify your email again' };
  if (!record.isVerified) return { verified: false, msg: 'Email not verified. Please complete OTP verification' };

  await OtpModel.deleteOne({ email });
  return { verified: true };
};
