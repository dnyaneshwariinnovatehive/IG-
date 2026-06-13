require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@innovateguide.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },
  google: {
    sheetsId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : '',
    driveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    driveScreenshotsFolderId: process.env.GOOGLE_DRIVE_SCREENSHOTS_FOLDER_ID,
  },
  whatsapp: {
    number: process.env.WHATSAPP_NUMBER || '919876543210',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  upload: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10),
  },
};
