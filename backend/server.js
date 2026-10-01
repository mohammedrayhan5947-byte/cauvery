require('dotenv').config();
const path     = require('path');
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');

const enquiryRouter  = require('./routes/enquiry');
const adminRouter    = require('./routes/admin');
const { initDB }     = require('./db/postgres');

const app  = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// CORS — allow your frontend domain
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://www.cauveryresorts.com',
  'http://localhost:5500',  // local dev (Live Server)
  'http://127.0.0.1:5500',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiter — max 100 requests per 15 min per IP
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true }));

// Routes
app.use('/api/enquiry', enquiryRouter);
app.use('/admin',       adminRouter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

// Auto-create DB table on cold start
initDB().catch(err => console.error('DB init error:', err));

// Local dev only — Vercel handles the listener itself
if (require.main === module) {
  app.listen(PORT, () => console.log(`Cauvery Resorts API running on port ${PORT}`));
}

module.exports = app;
