const express  = require('express');
const path     = require('path');
const { sql }  = require('../db/postgres');
const { requireAdmin, loginHandler } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin.html'));
});

router.post('/login', express.json(), loginHandler);

// GET /admin/api/enquiries
router.get('/api/enquiries', requireAdmin, async (req, res) => {
  const { status, page = 1, limit = 25 } = req.query;
  const offset = (page - 1) * parseInt(limit);

  try {
    let data, total;

    if (status && status !== 'all') {
      const rows  = await sql`SELECT * FROM enquiries WHERE status = ${status} ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;
      const count = await sql`SELECT COUNT(*) FROM enquiries WHERE status = ${status}`;
      data  = rows.rows;
      total = parseInt(count.rows[0].count);
    } else {
      const rows  = await sql`SELECT * FROM enquiries ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;
      const count = await sql`SELECT COUNT(*) FROM enquiries`;
      data  = rows.rows;
      total = parseInt(count.rows[0].count);
    }

    res.json({ data, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /admin/api/enquiries/:id
router.patch('/api/enquiries/:id', requireAdmin, express.json(), async (req, res) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body;

  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    if (status && admin_notes !== undefined) {
      await sql`UPDATE enquiries SET status=${status}, admin_notes=${admin_notes}, updated_at=NOW() WHERE id=${id}`;
    } else if (status) {
      await sql`UPDATE enquiries SET status=${status}, updated_at=NOW() WHERE id=${id}`;
    } else if (admin_notes !== undefined) {
      await sql`UPDATE enquiries SET admin_notes=${admin_notes}, updated_at=NOW() WHERE id=${id}`;
    }
    const result = await sql`SELECT * FROM enquiries WHERE id=${id}`;
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/api/stats
router.get('/api/stats', requireAdmin, async (req, res) => {
  try {
    const result = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status='pending')   AS pending,
        COUNT(*) FILTER (WHERE status='confirmed') AS confirmed,
        COUNT(*) FILTER (WHERE status='cancelled') AS cancelled,
        COUNT(*) FILTER (WHERE status='completed') AS completed,
        COUNT(*)                                   AS total
      FROM enquiries;
    `;
    const s = result.rows[0];
    res.json({
      pending:   parseInt(s.pending),
      confirmed: parseInt(s.confirmed),
      cancelled: parseInt(s.cancelled),
      completed: parseInt(s.completed),
      total:     parseInt(s.total),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
