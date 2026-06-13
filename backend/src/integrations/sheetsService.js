const { google } = require('googleapis');
const config = require('../config');

let sheetsClient = null;

const getClient = () => {
  if (sheetsClient) return sheetsClient;

  if (!config.google.serviceAccountEmail || !config.google.privateKey || !config.google.sheetsId) {
    return null;
  }

  try {
    const auth = new google.auth.JWT(
      config.google.serviceAccountEmail,
      null,
      config.google.privateKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
  } catch (err) {
    console.error('SheetsService: failed to create client:', err.message);
    return null;
  }
};

const SPREADSHEET_ID = config.google.sheetsId;

const getRows = async (sheetName) => {
  const client = getClient();
  if (!client) return [];

  try {
    const response = await client.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: sheetName,
    });

    const rows = response.data.values || [];
    if (rows.length < 2) return [];

    const headers = rows[0];
    return rows.slice(1).map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] !== undefined ? row[i] : '';
      });
      return obj;
    });
  } catch (err) {
    console.error(`SheetsService.getRows(${sheetName}) error:`, err.message);
    return [];
  }
};

const appendRow = async (sheetName, rowData) => {
  const client = getClient();
  if (!client) return false;

  try {
    const headerRes = await client.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!1:1`,
    });
    const headers = (headerRes.data.values && headerRes.data.values[0]) || Object.keys(rowData);
    const row = headers.map((h) => (rowData[h] !== undefined ? String(rowData[h]) : ''));

    await client.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: sheetName,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });
    return true;
  } catch (err) {
    console.error(`SheetsService.appendRow(${sheetName}) error:`, err.message);
    return false;
  }
};

const updateRowById = async (sheetName, id, updateData) => {
  const client = getClient();
  if (!client) return false;

  try {
    const response = await client.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: sheetName,
    });

    const rows = response.data.values || [];
    if (rows.length < 2) return false;

    const headers = rows[0];
    const idCol = headers.indexOf('id');
    if (idCol === -1) return false;

    const rowIndex = rows.findIndex((row, i) => i > 0 && row[idCol] === String(id));
    if (rowIndex === -1) return false;

    const currentRow = [...rows[rowIndex]];
    Object.keys(updateData).forEach((key) => {
      const colIdx = headers.indexOf(key);
      if (colIdx !== -1) {
        currentRow[colIdx] = String(updateData[key]);
      }
    });

    const rangeNotation = `${sheetName}!A${rowIndex + 1}`;
    await client.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: rangeNotation,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [currentRow] },
    });
    return true;
  } catch (err) {
    console.error(`SheetsService.updateRowById(${sheetName}, ${id}) error:`, err.message);
    return false;
  }
};

const deleteRowById = async (sheetName, id) => {
  const client = getClient();
  if (!client) return false;

  try {
    const metaRes = await client.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = metaRes.data.sheets.find(
      (s) => s.properties.title === sheetName
    );
    if (!sheet) return false;
    const sheetId = sheet.properties.sheetId;

    const response = await client.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: sheetName,
    });
    const rows = response.data.values || [];
    const headers = rows[0] || [];
    const idCol = headers.indexOf('id');
    if (idCol === -1) return false;

    const rowIndex = rows.findIndex((row, i) => i > 0 && row[idCol] === String(id));
    if (rowIndex === -1) return false;

    await client.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });
    return true;
  } catch (err) {
    console.error(`SheetsService.deleteRowById(${sheetName}, ${id}) error:`, err.message);
    return false;
  }
};

module.exports = { getRows, appendRow, updateRowById, deleteRowById };
