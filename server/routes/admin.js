const express = require('express');
const router = express.Router();
const { getStats, getAnalytics } = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/admin/stats — admin only
router.get('/stats', authenticateToken, requireAdmin, getStats);

// GET /api/admin/analytics — admin only
router.get('/analytics', authenticateToken, requireAdmin, getAnalytics);

module.exports = router;
