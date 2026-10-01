const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'Cauvery Resorts <onboarding@resend.dev>';

async function sendOwnerNotification({ id, name, phone, email, checkin, checkout, guests, roomtype, message }) {
  const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));

  await resend.emails.send({
    from: FROM,
    to: process.env.OWNER_EMAIL,
    subject: `New Booking Enquiry #${id} — ${name} (${checkin})`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0d4b0;border-radius:8px;overflow:hidden;">
      <div style="background:#B35A00;padding:24px 32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">New Booking Enquiry</h1>
        <p style="color:#fde8c8;margin:4px 0 0;">Cauvery Resorts — Enquiry #${id}</p>
      </div>
      <div style="padding:32px;background:#fff;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #f0e8d0;color:#888;width:140px;">Guest Name</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0e8d0;font-weight:bold;color:#2E1A0A;">${name}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #f0e8d0;color:#888;">Phone</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0e8d0;font-weight:bold;color:#2E1A0A;"><a href="tel:${phone}">${phone}</a></td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #f0e8d0;color:#888;">Email</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0e8d0;">${email || '—'}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #f0e8d0;color:#888;">Check-In</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0e8d0;font-weight:bold;">${checkin}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #f0e8d0;color:#888;">Check-Out</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0e8d0;font-weight:bold;">${checkout} <span style="color:#888;">(${nights} night${nights !== 1 ? 's' : ''})</span></td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #f0e8d0;color:#888;">Guests</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0e8d0;">${guests}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #f0e8d0;color:#888;">Room Type</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0e8d0;">${roomtype || '—'}</td></tr>
          <tr><td style="padding:10px 0;color:#888;vertical-align:top;">Message</td>
              <td style="padding:10px 0;color:#555;">${message || '—'}</td></tr>
        </table>
        <div style="margin-top:28px;">
          <a href="tel:${phone}" style="background:#B35A00;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">Call Guest</a>
          ${email ? `<a href="mailto:${email}" style="background:#D4A017;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;margin-left:8px;">Email Guest</a>` : ''}
        </div>
      </div>
      <div style="background:#FDF6EC;padding:16px 32px;color:#888;font-size:13px;">
        Submitted from cauveryresorts.com · Enquiry ID: #${id}
      </div>
    </div>`,
  });
}

async function sendGuestConfirmation({ name, email, checkin, checkout, guests, roomtype }) {
  const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your Enquiry at Cauvery Resorts — We'll be in touch soon`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0d4b0;border-radius:8px;overflow:hidden;">
      <div style="background:#B35A00;padding:24px 32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Namaste, ${name}</h1>
        <p style="color:#fde8c8;margin:4px 0 0;">Thank you for choosing Cauvery Resorts</p>
      </div>
      <div style="padding:32px;background:#fff;">
        <p style="color:#2E1A0A;font-size:16px;line-height:1.6;">
          We have received your enquiry and will contact you within a few hours to confirm availability and your booking.
        </p>
        <div style="background:#FDF6EC;border:1px solid #e0d4b0;border-radius:8px;padding:20px;margin:24px 0;">
          <h3 style="color:#B35A00;margin:0 0 16px;font-size:15px;">Your Enquiry Details</h3>
          <p style="margin:6px 0;color:#555;"><strong>Check-In:</strong> ${checkin}</p>
          <p style="margin:6px 0;color:#555;"><strong>Check-Out:</strong> ${checkout} (${nights} night${nights !== 1 ? 's' : ''})</p>
          <p style="margin:6px 0;color:#555;"><strong>Guests:</strong> ${guests}</p>
          <p style="margin:6px 0;color:#555;"><strong>Room:</strong> ${roomtype || 'To be advised'}</p>
        </div>
        <p style="color:#555;font-size:14px;">Need to reach us directly?</p>
        <a href="tel:+919449485133" style="background:#B35A00;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">+91-944-9485133</a>
        <a href="https://wa.me/919449485133" style="background:#25D366;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;margin-left:8px;">WhatsApp</a>
      </div>
      <div style="background:#FDF6EC;padding:16px 32px;color:#888;font-size:13px;">
        Cauvery Resorts · Near Talacauvery &amp; Bhagamandala, Coorg, Karnataka — 571201
      </div>
    </div>`,
  });
}

module.exports = { sendOwnerNotification, sendGuestConfirmation };
