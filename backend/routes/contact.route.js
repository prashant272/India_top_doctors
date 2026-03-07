const express = require('express');
const Contactrouter = express.Router();
const { sendContactEmail, sendContactAutoReply } = require('../services/email.service');

Contactrouter.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
  }

  try {
    await Promise.all([
      sendContactEmail({ name, email, subject, message }),
      sendContactAutoReply({ name, email }),
    ]);
    res.json({ success: true, message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
});

module.exports = Contactrouter;
