const express = require('express');
const router = express.Router();
const { createCustomRequest, getCustomRequests } = require('./requestController');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');

router.post('/custom', createCustomRequest);
router.get('/custom', authenticateToken, requireAdmin, getCustomRequests);

module.exports = router;
