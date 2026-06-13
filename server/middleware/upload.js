const multer = require('multer');
const config = require('../config');

const storage = multer.memoryStorage();

const projectFileFilter = (req, file, cb) => {
  const allowed = ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/octet-stream'];
  if (allowed.includes(file.mimetype) || file.originalname.match(/\.(zip|rar|7z)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only ZIP, RAR, 7Z files are allowed'), false);
  }
};

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const uploadProjectFile = multer({
  storage,
  fileFilter: projectFileFilter,
  limits: { fileSize: config.upload.maxFileSizeMB * 1024 * 1024 },
}).single('projectFile');

const uploadScreenshots = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array('screenshots', 10);

module.exports = { uploadProjectFile, uploadScreenshots };
