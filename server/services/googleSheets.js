const { google } = require('googleapis');
const config = require('../config');

// ── Auth ───────────────────────────────────────────────────────────────────
const auth = new google.auth.JWT({
  email: config.google.serviceAccountEmail,
  key: config.google.privateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = config.google.sheetsId;

// Sheet names used across the application
// Users | Projects | Categories | CustomRequests | Analytics | Settings

/**
 * Determine whether Google Sheets has been configured.
 */
function isConfigured() {
  return Boolean(SPREADSHEET_ID && config.google.serviceAccountEmail && config.google.privateKey);
}

/**
 * Build an A1 notation range string.
 * rowIndex is 1-based index of data rows (excludes the header row at row 1).
 * The actual spreadsheet row is therefore rowIndex + 1.
 */
function rowRange(sheetName, rowIndex) {
  const sheetRow = rowIndex + 1; // +1 to skip header
  return `${sheetName}!A${sheetRow}:ZZ${sheetRow}`;
}

const SheetsService = {
  /**
   * Returns all data rows from a sheet as an array of plain objects.
   * The first row of the sheet is treated as the header.
   * @param {string} sheetName
   * @returns {Promise<Object[]>}
   */
  async getRows(sheetName) {
    if (!isConfigured()) {
      console.warn('[SheetsService] Google Sheets not configured — returning empty array.');
      return [];
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:ZZ`,
    });

    const rows = response.data.values || [];
    if (rows.length < 2) return [];

    const [headers, ...dataRows] = rows;
    return dataRows.map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] !== undefined ? row[i] : '';
      });
      return obj;
    });
  },

  /**
   * Appends a new row to the sheet.
   * @param {string} sheetName
   * @param {Object} rowData  Key/value pairs; keys must match header names.
   * @returns {Promise<void>}
   */
  async appendRow(sheetName, rowData) {
    if (!isConfigured()) {
      console.warn('[SheetsService] Google Sheets not configured — skipping appendRow.');
      return;
    }

    // Fetch headers so we can order the values correctly.
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!1:1`,
    });

    const headers = (headerResponse.data.values || [[]])[0] || [];
    const values = headers.map((h) => (rowData[h] !== undefined ? rowData[h] : ''));

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:A`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [values] },
    });
  },

  /**
   * Updates an existing data row.
   * @param {string} sheetName
   * @param {number} rowIndex  1-based index among data rows (header excluded).
   * @param {Object} rowData
   * @returns {Promise<void>}
   */
  async updateRow(sheetName, rowIndex, rowData) {
    if (!isConfigured()) {
      console.warn('[SheetsService] Google Sheets not configured — skipping updateRow.');
      return;
    }

    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!1:1`,
    });

    const headers = (headerResponse.data.values || [[]])[0] || [];
    const values = headers.map((h) => (rowData[h] !== undefined ? rowData[h] : ''));

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: rowRange(sheetName, rowIndex),
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    });
  },

  /**
   * Deletes a data row from the sheet.
   * @param {string} sheetName
   * @param {number} rowIndex  1-based index among data rows (header excluded).
   * @returns {Promise<void>}
   */
  async deleteRow(sheetName, rowIndex) {
    if (!isConfigured()) {
      console.warn('[SheetsService] Google Sheets not configured — skipping deleteRow.');
      return;
    }

    // Resolve numeric sheetId for the named sheet.
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheetMeta = (meta.data.sheets || []).find(
      (s) => s.properties.title === sheetName
    );
    if (!sheetMeta) throw new Error(`Sheet "${sheetName}" not found`);

    const sheetId = sheetMeta.properties.sheetId;
    const sheetRow = rowIndex + 1; // convert to actual spreadsheet row (0-indexed for API)

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: sheetRow - 1, // API is 0-indexed
                endIndex: sheetRow,       // exclusive
              },
            },
          },
        ],
      },
    });
  },

  /**
   * Returns the first data row where row[field] === value, or null.
   * @param {string} sheetName
   * @param {string} field
   * @param {*} value
   * @returns {Promise<Object|null>}
   */
  async findRow(sheetName, field, value) {
    const rows = await SheetsService.getRows(sheetName);
    return rows.find((row) => row[field] === value) || null;
  },

  /**
   * Returns all data rows where row[field] === value.
   * @param {string} sheetName
   * @param {string} field
   * @param {*} value
   * @returns {Promise<Object[]>}
   */
  async findRows(sheetName, field, value) {
    const rows = await SheetsService.getRows(sheetName);
    return rows.filter((row) => row[field] === value);
  },

  /**
   * Returns the count of data rows (header row excluded).
   * @param {string} sheetName
   * @returns {Promise<number>}
   */
  async getRowCount(sheetName) {
    if (!isConfigured()) return 0;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:A`,
    });

    const rows = response.data.values || [];
    // Subtract 1 for the header row.
    return Math.max(0, rows.length - 1);
  },
};

module.exports = SheetsService;
