const { transporter } = require('../config/nodemailer');


const sendContactEmail = async ({ name, email, subject, message }) => {
  await transporter.sendMail({
    from: "noreply@globalhealthcareawards.com",
    to: "sundriyalabhishek98@gmail.com",
    replyTo: "sundriyalabhishek98@gmail.com",
    subject: subject || `New Contact Message from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #0d9488, #0f766e); padding: 24px; border-radius: 10px; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 22px;">New Contact Message</h1>
          <p style="color: #99f6e4; margin: 6px 0 0; font-size: 14px;">Received via India Top Doctor contact form</p>
        </div>
        <div style="background: white; border-radius: 10px; padding: 24px; border: 1px solid #e5e7eb;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; width: 30%;">
                <span style="font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">Name</span>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                <span style="font-size: 14px; color: #111827; font-weight: 600;">${name}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                <span style="font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">Email</span>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                <a href="mailto:${email}" style="font-size: 14px; color: #0d9488; font-weight: 600;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                <span style="font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">Subject</span>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                <span style="font-size: 14px; color: #111827;">${subject || '—'}</span>
              </td>
            </tr>
          </table>
          <div style="margin-top: 20px;">
            <p style="font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">Message</p>
            <div style="background: #f9fafb; border-left: 4px solid #0d9488; padding: 16px; border-radius: 0 8px 8px 0; font-size: 14px; color: #374151; line-height: 1.7; white-space: pre-wrap;">${message}</div>
          </div>
        </div>
        <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 20px;">
          India Top Doctor · C-31, Nawada Housing Complex, New Delhi 110059
        </p>
      </div>
    `,
  });
};

const sendContactAutoReply = async ({ name, email }) => {
  await transporter.sendMail({
    from: `"India Top Doctor" <${process.env.BREVO_SMTP_USER}>`,
    to: email,
    subject: 'We received your message — India Top Doctor',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #0d9488, #0f766e); padding: 24px; border-radius: 10px; margin-bottom: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Thank You, ${name}!</h1>
          <p style="color: #99f6e4; margin: 8px 0 0; font-size: 14px;">We've received your message</p>
        </div>
        <div style="background: white; border-radius: 10px; padding: 24px; border: 1px solid #e5e7eb; text-align: center;">
          <div style="width: 60px; height: 60px; background: #f0fdfa; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <span style="font-size: 28px;">✅</span>
          </div>
          <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0 0 16px;">
            Hi <strong>${name}</strong>, thanks for reaching out to <strong>India Top Doctor</strong>. Our team will review your message and get back to you within <strong>24 hours</strong>.
          </p>
          <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 14px; margin-top: 16px;">
            <p style="font-size: 13px; color: #0f766e; margin: 0;">
              📞 Urgent? Call us at <strong>+91-9319 9319 04</strong><br/>
              🕒 Mon–Sat: 9:00 AM – 6:00 PM
            </p>
          </div>
        </div>
        <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 20px;">
          India Top Doctor · C-31, Nawada Housing Complex, New Delhi 110059
        </p>
      </div>
    `,
  });
};

module.exports = { sendContactEmail, sendContactAutoReply };
