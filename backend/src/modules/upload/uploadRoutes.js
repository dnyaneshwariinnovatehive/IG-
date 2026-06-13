const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const { uploadProjectFile, uploadScreenshots } = require('../../middleware/upload');
const DriveService = require('../../integrations/googleDrive');
const config = require('../../config');
const { v4: uuidv4 } = require('uuid');

router.post('/project-zip', authenticateToken, (req, res, next) => {
  uploadProjectFile(req, res, async (err) => {
    if (err) return next(err);
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    try {
      const filename = `project_${uuidv4()}_${req.file.originalname}`;
      const result = await DriveService.uploadFile(
        req.file.buffer,
        filename,
        req.file.mimetype,
        config.google.driveFolderId
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  });
});

router.post('/screenshots', authenticateToken, (req, res, next) => {
  uploadScreenshots(req, res, async (err) => {
    if (err) return next(err);
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    try {
      const uploads = await Promise.all(
        req.files.map(async (file) => {
          const filename = `screenshot_${uuidv4()}_${file.originalname}`;
          return DriveService.uploadFile(
            file.buffer,
            filename,
            file.mimetype,
            config.google.driveScreenshotsFolderId || config.google.driveFolderId
          );
        })
      );
      res.json({ success: true, data: uploads });
    } catch (error) {
      next(error);
    }
  });
});

module.exports = router;
