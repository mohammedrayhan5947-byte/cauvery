// Input validation for enquiry form submissions

function validateEnquiry(req, res, next) {
  const { name, phone, checkin, checkout, guests } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2)        errors.push('Name is required');
  if (!phone || !/^[+\d\s\-]{7,15}$/.test(phone.trim())) errors.push('Valid phone number is required');
  if (!checkin)                                errors.push('Check-in date is required');
  if (!checkout)                               errors.push('Check-out date is required');
  if (!guests || isNaN(guests) || guests < 8)  errors.push('Group stays only: minimum 8 guests');

  if (checkin && checkout && new Date(checkin) >= new Date(checkout)) {
    errors.push('Check-out must be after check-in');
  }
  if (checkin && new Date(checkin) < new Date(new Date().toDateString())) {
    errors.push('Check-in date cannot be in the past');
  }

  if (errors.length) return res.status(400).json({ error: errors.join('. ') });
  next();
}

module.exports = { validateEnquiry };
