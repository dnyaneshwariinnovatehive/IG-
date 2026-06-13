const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  getTrending,
  getFeatured,
  getTopSelling,
  getNew,
  createProject,
  updateProject,
  deleteProject,
  approveProject,
  rejectProject,
} = require('../controllers/projectController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

// Public / optionally-authenticated list endpoints
router.get('/', optionalAuth, getProjects);
router.get('/trending', getTrending);
router.get('/featured', getFeatured);
router.get('/top-selling', getTopSelling);
router.get('/new', getNew);

// Single project (must come after named routes to avoid param conflicts)
router.get('/:id', optionalAuth, getProject);

// Authenticated endpoints
router.post('/', authenticateToken, createProject);
router.put('/:id', authenticateToken, requireAdmin, updateProject);
router.delete('/:id', authenticateToken, requireAdmin, deleteProject);
router.post('/:id/approve', authenticateToken, requireAdmin, approveProject);
router.post('/:id/reject', authenticateToken, requireAdmin, rejectProject);

module.exports = router;
