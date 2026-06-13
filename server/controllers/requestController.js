const { v4: uuidv4 } = require('uuid');
const SheetsService = require('../services/sheetsService');

const SHEET_NAME = 'CustomRequests';

/**
 * POST /api/requests/custom
 * Save a custom project request to the CustomRequests sheet.
 * No authentication required — anyone can submit.
 */
const createCustomRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      projectType,
      budget,
      timeline,
      technologies,
      description,
      additionalInfo,
    } = req.body;

    if (!name || !email || !description) {
      return res
        .status(400)
        .json({ success: false, message: 'name, email and description are required' });
    }

    const newRequest = {
      id: uuidv4(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '',
      projectType: projectType || '',
      budget: budget || '',
      timeline: timeline || '',
      technologies: Array.isArray(technologies) ? technologies.join(',') : technologies || '',
      description: description.trim(),
      additionalInfo: additionalInfo || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await SheetsService.appendRow(SHEET_NAME, newRequest);

    return res.status(201).json({
      success: true,
      message: 'Custom request submitted successfully. We will contact you soon.',
      data: {
        id: newRequest.id,
        name: newRequest.name,
        email: newRequest.email,
        status: newRequest.status,
        createdAt: newRequest.createdAt,
      },
    });
  } catch (err) {
    console.error('createCustomRequest error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit request' });
  }
};

/**
 * GET /api/requests/custom
 * Return all custom requests. Admin only.
 */
const getCustomRequests = async (req, res) => {
  try {
    let rows = [];

    try {
      rows = await SheetsService.getRows(SHEET_NAME);
    } catch (sheetErr) {
      console.warn('getCustomRequests: Sheets unavailable, returning empty list:', sheetErr.message);
    }

    const data = rows.map((row) => ({
      id: row.id || '',
      name: row.name || '',
      email: row.email || '',
      phone: row.phone || '',
      projectType: row.projectType || '',
      budget: row.budget || '',
      timeline: row.timeline || '',
      technologies: row.technologies
        ? row.technologies.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      description: row.description || '',
      additionalInfo: row.additionalInfo || '',
      status: row.status || 'pending',
      createdAt: row.createdAt || '',
    }));

    // Sort newest first
    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, data, total: data.length });
  } catch (err) {
    console.error('getCustomRequests error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
};

module.exports = { createCustomRequest, getCustomRequests };
