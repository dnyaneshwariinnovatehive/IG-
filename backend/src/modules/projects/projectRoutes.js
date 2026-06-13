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
} = require('./projectController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../../middleware/auth');

router.get('/', optionalAuth, getProjects);
router.get('/trending', getTrending);
router.get('/featured', getFeatured);
router.get('/top-selling', getTopSelling);
router.get('/new', getNew);

router.get('/:id', optionalAuth, getProject);

router.post('/', authenticateToken, createProject);
router.put('/:id', authenticateToken, requireAdmin, updateProject);
router.delete('/:id', authenticateToken, requireAdmin, deleteProject);
router.post('/:id/approve', authenticateToken, requireAdmin, approveProject);
router.post('/:id/reject', authenticateToken, requireAdmin, rejectProject);

module.exports = router;
