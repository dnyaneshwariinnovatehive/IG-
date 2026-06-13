const express = require('express');
const router = express.Router();
const { getStats, getAnalytics } = require('./adminController');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');

router.get('/stats', authenticateToken, requireAdmin, getStats);
router.get('/analytics', authenticateToken, requireAdmin, getAnalytics);

module.exports = router;
