const express = require('express');
const router = express.Router();
const { createCustomRequest, getCustomRequests } = require('../controllers/requestController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// POST /api/requests/custom — public submission
router.post('/custom', createCustomRequest);

// GET /api/requests/custom — admin only
router.get('/custom', authenticateToken, requireAdmin, getCustomRequests);

module.exports = router;
