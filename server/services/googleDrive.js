const { google } = require('googleapis');
const { Readable } = require('stream');
const config = require('../config');

// ── Auth ───────────────────────────────────────────────────────────────────
const auth = new google.auth.JWT({
  email: config.google.serviceAccountEmail,
  key: config.google.privateKey,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Determine whether Google Drive has been configured.
 */
function isConfigured() {
  return Boolean(config.google.serviceAccountEmail && config.google.privateKey);
}

/**
 * Convert a Node.js Buffer to a Readable stream.
 */
function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

const DriveService = {
  /**
   * Uploads a buffer to Google Drive.
   * @param {Buffer} buffer        File content.
   * @param {string} filename      Desired file name on Drive.
   * @param {string} mimeType      MIME type of the file.
   * @param {string} [folderId]    Parent folder ID (optional).
   * @returns {Promise<{ fileId: string, fileName: string, webViewLink: string, downloadUrl: string }>}
   */
  async uploadFile(buffer, filename, mimeType, folderId) {
    if (!isConfigured()) {
      console.warn('[DriveService] Google Drive not configured — returning placeholder.');
      return {
        fileId: null,
        fileName: filename,
        webViewLink: '',
        downloadUrl: '',
      };
    }

    const fileMetadata = {
      name: filename,
      ...(folderId ? { parents: [folderId] } : {}),
    };

    const media = {
      mimeType,
      body: bufferToStream(buffer),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, webViewLink',
    });

    const fileId = response.data.id;
    const fileName = response.data.name;
    const webViewLink = response.data.webViewLink || '';
    const downloadUrl = fileId
      ? `https://drive.google.com/uc?export=download&id=${fileId}`
      : '';

    return { fileId, fileName, webViewLink, downloadUrl };
  },

  /**
   * Returns a direct download URL for a Drive file.
   * @param {string} fileId
   * @returns {string}
   */
  getDownloadUrl(fileId) {
    if (!fileId) return '';
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  },

  /**
   * Permanently deletes a file from Google Drive.
   * @param {string} fileId
   * @returns {Promise<void>}
   */
  async deleteFile(fileId) {
    if (!isConfigured()) {
      console.warn('[DriveService] Google Drive not configured — skipping deleteFile.');
      return;
    }
    await drive.files.delete({ fileId });
  },

  /**
   * Creates a folder on Google Drive.
   * @param {string} name             Folder name.
   * @param {string} [parentFolderId] Parent folder ID (optional).
   * @returns {Promise<string>}       The new folder's ID.
   */
  async createFolder(name, parentFolderId) {
    if (!isConfigured()) {
      console.warn('[DriveService] Google Drive not configured — skipping createFolder.');
      return null;
    }

    const fileMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentFolderId ? { parents: [parentFolderId] } : {}),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    return response.data.id;
  },

  /**
   * Makes a Drive file publicly readable (anyone with the link).
   * @param {string} fileId
   * @returns {Promise<void>}
   */
  async makePublic(fileId) {
    if (!isConfigured()) {
      console.warn('[DriveService] Google Drive not configured — skipping makePublic.');
      return;
    }

    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
  },
};

module.exports = DriveService;
