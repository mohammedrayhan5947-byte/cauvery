// Token-based auth for the admin panel.
// Token is stored in localStorage on the client after login.
const crypto = require('crypto');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_SECRET   = process.env.ADMIN_SECRET;

if (!ADMIN_PASSWORD || !ADMIN_SECRET || ADMIN_SECRET === 'change-me') {
  console.error('ADMIN_PASSWORD and a strong ADMIN_SECRET must be set; admin login is disabled.');
}

// Constant-time string comparison (hashes first so length differences don't leak)
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function sign(payload) {
  return crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('base64url');
}

// Token format: base64url(payload).hmac
function makeToken() {
  const payload = Buffer.from(JSON.stringify({ ts: Date.now(), role: 'admin' })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  if (!ADMIN_SECRET || !token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !safeCompare(sig, sign(payload))) return false;
  try {
    const { ts } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    // Token expires after 8 hours
    return Date.now() - ts < 8 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

// Middleware: protect admin API routes
function requireAdmin(req, res, next) {
  const auth  = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Login route handler
function loginHandler(req, res) {
  const { password } = req.body;
  if (!ADMIN_PASSWORD || !ADMIN_SECRET) return res.status(503).json({ error: 'Admin not configured' });
  if (!safeCompare(password, ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Wrong password' });
  }
  res.json({ token: makeToken() });
}

module.exports = { requireAdmin, loginHandler };
