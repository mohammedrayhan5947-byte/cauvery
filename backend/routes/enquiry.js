const express   = require('express');
const rateLimit = require('express-rate-limit');
const { sql }   = require('../db/postgres');
const { sendOwnerNotification, sendGuestConfirmation } = require('../mailer');
const { validateEnquiry } = require('../middleware/validate');

const router = express.Router();

const submitLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many submissions. Please call us directly at +91-944-9485133.' },
});

router.post('/', submitLimit, validateEnquiry, async (req, res) => {
  const { name, phone, email, checkin, checkout, guests, roomtype, message } = req.body;

  const sourcePage = req.headers.referer
    ? new URL(req.headers.referer).pathname.split('/').pop() || 'direct'
    : 'direct';

  try {
    const result = await sql`
      INSERT INTO enquiries (name, phone, email, checkin, checkout, guests, room_type, message, source_page)
      VALUES (
        ${name.trim()},
        ${phone.trim()},
        ${email ? email.trim().toLowerCase() : null},
        ${checkin},
        ${checkout},
        ${parseInt(guests, 10)},
        ${roomtype || null},
        ${message ? message.trim() : null},
        ${sourcePage}
      )
      RETURNING id;
    `;

    const enquiryId = result.rows[0].id;

    Promise.all([
      sendOwnerNotification({ id: enquiryId, name, phone, email, checkin, checkout, guests, roomtype, message }),
      email ? sendGuestConfirmation({ name, email, checkin, checkout, guests, roomtype }) : Promise.resolve(),
    ]).catch(err => console.error('Email error:', err));

    res.status(201).json({
      success: true,
      message: 'Enquiry received! We will contact you within a few hours.',
      id: enquiryId,
    });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Could not save enquiry. Please call us directly.' });
  }
});

module.exports = router;
