const { v4: uuidv4 } = require('uuid');
const SheetsService = require('../services/sheetsService');

const SHEET_NAME = 'Projects';

// ---------------------------------------------------------------------------
// Fallback mock data used when Sheets is unavailable
// ---------------------------------------------------------------------------
const MOCK_PROJECTS = [
  {
    id: 'mock-1',
    title: 'AI Chatbot Platform',
    description: 'A full-featured AI chatbot built with NLP and deep learning techniques.',
    price: '2999',
    domain: 'AI & ML',
    difficulty: 'Advanced',
    type: 'admin',
    technologies: 'Python,TensorFlow,Flask,React',
    screenshots: '',
    videoUrl: '',
    githubUrl: '',
    status: 'approved',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    views: '342',
    downloads: '58',
    rating: '4.7',
    reviewCount: '23',
    isTrending: 'true',
    isNew: 'false',
    isFeatured: 'true',
    isTopSelling: 'true',
    tags: 'AI,NLP,Chatbot',
    creatorId: 'admin',
    creatorName: 'Admin User',
    creatorEmail: 'admin@innovateguide.com',
    zipFileId: '',
  },
  {
    id: 'mock-2',
    title: 'E-Commerce Web App',
    description: 'A complete e-commerce solution with cart, payments, and admin dashboard.',
    price: '3499',
    domain: 'Web Development',
    difficulty: 'Intermediate',
    type: 'admin',
    technologies: 'React,Node.js,MongoDB,Stripe',
    screenshots: '',
    videoUrl: '',
    githubUrl: '',
    status: 'approved',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    views: '510',
    downloads: '87',
    rating: '4.5',
    reviewCount: '41',
    isTrending: 'false',
    isNew: 'false',
    isFeatured: 'true',
    isTopSelling: 'true',
    tags: 'ecommerce,react,nodejs',
    creatorId: 'admin',
    creatorName: 'Admin User',
    creatorEmail: 'admin@innovateguide.com',
    zipFileId: '',
  },
  {
    id: 'mock-3',
    title: 'IoT Smart Home System',
    description: 'Control your home devices remotely using Raspberry Pi and MQTT.',
    price: '1999',
    domain: 'IoT',
    difficulty: 'Intermediate',
    type: 'admin',
    technologies: 'Python,MQTT,Raspberry Pi,React',
    screenshots: '',
    videoUrl: '',
    githubUrl: '',
    status: 'approved',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    views: '189',
    downloads: '31',
    rating: '4.3',
    reviewCount: '12',
    isTrending: 'true',
    isNew: 'true',
    isFeatured: 'false',
    isTopSelling: 'false',
    tags: 'IoT,SmartHome,Raspberry Pi',
    creatorId: 'admin',
    creatorName: 'Admin User',
    creatorEmail: 'admin@innovateguide.com',
    zipFileId: '',
  },
  {
    id: 'mock-4',
    title: 'Blockchain Voting System',
    description: 'Secure and transparent voting powered by Ethereum smart contracts.',
    price: '4999',
    domain: 'Blockchain',
    difficulty: 'Advanced',
    type: 'admin',
    technologies: 'Solidity,Ethereum,React,Web3.js',
    screenshots: '',
    videoUrl: '',
    githubUrl: '',
    status: 'approved',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    views: '267',
    downloads: '44',
    rating: '4.8',
    reviewCount: '18',
    isTrending: 'false',
    isNew: 'true',
    isFeatured: 'true',
    isTopSelling: 'false',
    tags: 'blockchain,voting,ethereum',
    creatorId: 'admin',
    creatorName: 'Admin User',
    creatorEmail: 'admin@innovateguide.com',
    zipFileId: '',
  },
  {
    id: 'mock-5',
    title: 'Data Science Dashboard',
    description: 'Interactive data visualization dashboard with real-time analytics.',
    price: '2499',
    domain: 'Data Science',
    difficulty: 'Beginner',
    type: 'admin',
    technologies: 'Python,Pandas,Plotly,Dash',
    screenshots: '',
    videoUrl: '',
    githubUrl: '',
    status: 'approved',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    views: '98',
    downloads: '15',
    rating: '4.2',
    reviewCount: '7',
    isTrending: 'false',
    isNew: 'true',
    isFeatured: 'false',
    isTopSelling: 'false',
    tags: 'data,visualization,dashboard',
    creatorId: 'admin',
    creatorName: 'Admin User',
    creatorEmail: 'admin@innovateguide.com',
    zipFileId: '',
  },
];

// ---------------------------------------------------------------------------
// Helper: normalise a raw sheet row into a typed project object
// ---------------------------------------------------------------------------
const normaliseProject = (row) => ({
  id: row.id || '',
  title: row.title || '',
  description: row.description || '',
  price: parseFloat(row.price) || 0,
  domain: row.domain || '',
  difficulty: row.difficulty || '',
  type: row.type || 'admin',
  technologies: row.technologies
    ? row.technologies.split(',').map((t) => t.trim()).filter(Boolean)
    : [],
  screenshots: row.screenshots
    ? row.screenshots.split(',').map((s) => s.trim()).filter(Boolean)
    : [],
  videoUrl: row.videoUrl || '',
  githubUrl: row.githubUrl || '',
  status: row.status || 'pending',
  createdAt: row.createdAt || new Date().toISOString(),
  views: parseInt(row.views, 10) || 0,
  downloads: parseInt(row.downloads, 10) || 0,
  rating: parseFloat(row.rating) || 0,
  reviewCount: parseInt(row.reviewCount, 10) || 0,
  isTrending: row.isTrending === 'true' || row.isTrending === true,
  isNew: row.isNew === 'true' || row.isNew === true,
  isFeatured: row.isFeatured === 'true' || row.isFeatured === true,
  isTopSelling: row.isTopSelling === 'true' || row.isTopSelling === true,
  tags: row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
  creatorId: row.creatorId || '',
  creatorName: row.creatorName || '',
  creatorEmail: row.creatorEmail || '',
  zipFileId: row.zipFileId || '',
});

// Strips creator PII from a project before returning to public callers
const publicProject = (p) => {
  const { creatorName, creatorEmail, ...rest } = p;
  return rest;
};

// ---------------------------------------------------------------------------
// Fetch projects from Sheets; fall back to mocks on failure
// ---------------------------------------------------------------------------
const fetchProjects = async () => {
  try {
    const rows = await SheetsService.getRows(SHEET_NAME);
    if (rows && rows.length > 0) {
      return rows.map(normaliseProject);
    }
  } catch (err) {
    console.error('fetchProjects error:', err.message);
  }
  return MOCK_PROJECTS.map(normaliseProject);
};

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * GET /api/projects
 * Paginated, filtered, sorted list — public-facing (approved/published only).
 */
const getProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      domain,
      search,
      sort = 'createdAt',
      difficulty,
      minPrice,
      maxPrice,
      status,
    } = req.query;

    const isAdmin = req.user && req.user.role === 'admin';
    let projects = await fetchProjects();

    // Non-admins only see approved/published projects
    if (!isAdmin) {
      projects = projects.filter(
        (p) => p.status === 'approved' || p.status === 'published'
      );
    } else if (status) {
      projects = projects.filter((p) => p.status === status);
    }

    // Domain / category filter
    const domainFilter = domain || category;
    if (domainFilter) {
      const df = domainFilter.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.domain.toLowerCase() === df ||
          p.domain.toLowerCase().replace(/\s+/g, '-') === df ||
          p.domain.toLowerCase().replace(/[^a-z0-9]/g, '-') === df
      );
    }

    // Difficulty filter
    if (difficulty) {
      projects = projects.filter(
        (p) => p.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    // Price range filter
    if (minPrice !== undefined) {
      projects = projects.filter((p) => p.price >= parseFloat(minPrice));
    }
    if (maxPrice !== undefined) {
      projects = projects.filter((p) => p.price <= parseFloat(maxPrice));
    }

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.domain.toLowerCase().includes(q) ||
          p.technologies.some((t) => t.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortDir = sort.startsWith('-') ? -1 : 1;
    const sortMap = {
      createdAt: (a, b) => sortDir * (new Date(b.createdAt) - new Date(a.createdAt)),
      price: (a, b) => sortDir * (a.price - b.price),
      views: (a, b) => sortDir * (b.views - a.views),
      downloads: (a, b) => sortDir * (b.downloads - a.downloads),
      rating: (a, b) => sortDir * (b.rating - a.rating),
      title: (a, b) => sortDir * a.title.localeCompare(b.title),
    };
    if (sortMap[sortField]) {
      projects.sort(sortMap[sortField]);
    } else {
      projects.sort(sortMap.createdAt);
    }

    const total = projects.length;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const paginated = projects.slice(start, start + limitNum);

    const data = isAdmin ? paginated : paginated.map(publicProject);

    return res.json({
      success: true,
      data,
      pagination: { page: pageNum, limit: limitNum, total, totalPages },
    });
  } catch (err) {
    console.error('getProjects error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
};

/**
 * GET /api/projects/:id
 * Single project; increments view count; hides creator PII from public callers.
 */
const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user && req.user.role === 'admin';

    let projects = await fetchProjects();
    let project = projects.find((p) => p.id === id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!isAdmin && project.status !== 'approved' && project.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Increment view count (best-effort, ignore failures)
    const newViews = project.views + 1;
    SheetsService.updateRowById(SHEET_NAME, id, { views: newViews }).catch(() => {});
    project = { ...project, views: newViews };

    const data = isAdmin ? project : publicProject(project);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getProject error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch project' });
  }
};

// Helper for simple filtered+limited project list responses
const simpleList = (filter, sorter) => async (req, res) => {
  try {
    let projects = await fetchProjects();
    projects = projects.filter(
      (p) => p.status === 'approved' || p.status === 'published'
    );
    if (filter) projects = projects.filter(filter);
    if (sorter) projects.sort(sorter);
    const data = projects.slice(0, 10).map(publicProject);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('simpleList error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
};

const getTrending = simpleList((p) => p.isTrending === true);
const getFeatured = simpleList((p) => p.isFeatured === true);
const getTopSelling = simpleList((p) => p.isTopSelling === true);
const getNew = simpleList(
  (p) => p.isNew === true,
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
);

/**
 * POST /api/projects
 * Create a new project. Requires authentication.
 */
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      domain,
      difficulty,
      type,
      technologies,
      screenshots,
      videoUrl,
      githubUrl,
      tags,
      zipFileId,
      isTrending,
      isFeatured,
      isTopSelling,
      isNew: isNewFlag,
    } = req.body;

    if (!title || !description || !domain) {
      return res
        .status(400)
        .json({ success: false, message: 'title, description and domain are required' });
    }

    const newProject = {
      id: uuidv4(),
      title,
      description,
      price: price || '0',
      domain,
      difficulty: difficulty || 'Beginner',
      type: type || 'student',
      technologies: Array.isArray(technologies) ? technologies.join(',') : technologies || '',
      screenshots: Array.isArray(screenshots) ? screenshots.join(',') : screenshots || '',
      videoUrl: videoUrl || '',
      githubUrl: githubUrl || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      views: '0',
      downloads: '0',
      rating: '0',
      reviewCount: '0',
      isTrending: isTrending ? 'true' : 'false',
      isNew: isNewFlag !== undefined ? String(isNewFlag) : 'true',
      isFeatured: isFeatured ? 'true' : 'false',
      isTopSelling: isTopSelling ? 'true' : 'false',
      tags: Array.isArray(tags) ? tags.join(',') : tags || '',
      creatorId: req.user.id,
      creatorName: req.user.name || req.user.email,
      creatorEmail: req.user.email,
      zipFileId: zipFileId || '',
    };

    await SheetsService.appendRow(SHEET_NAME, newProject);

    return res.status(201).json({
      success: true,
      message: 'Project submitted for review',
      data: normaliseProject(newProject),
    });
  } catch (err) {
    console.error('createProject error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create project' });
  }
};

/**
 * PUT /api/projects/:id
 * Update project. Admin only.
 */
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Normalise array fields to CSV
    ['technologies', 'screenshots', 'tags'].forEach((field) => {
      if (Array.isArray(updates[field])) {
        updates[field] = updates[field].join(',');
      }
    });
    // Normalise boolean fields
    ['isTrending', 'isNew', 'isFeatured', 'isTopSelling'].forEach((field) => {
      if (field in updates) {
        updates[field] = String(updates[field]);
      }
    });

    const ok = await SheetsService.updateRowById(SHEET_NAME, id, updates);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Project not found or update failed' });
    }

    return res.json({ success: true, message: 'Project updated successfully' });
  } catch (err) {
    console.error('updateProject error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update project' });
  }
};

/**
 * DELETE /api/projects/:id
 * Delete project. Admin only.
 */
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await SheetsService.deleteRowById(SHEET_NAME, id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Project not found or delete failed' });
    }
    return res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    console.error('deleteProject error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
};

/**
 * POST /api/projects/:id/approve
 * Approve project. Admin only.
 */
const approveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await SheetsService.updateRowById(SHEET_NAME, id, { status: 'approved' });
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    return res.json({ success: true, message: 'Project approved' });
  } catch (err) {
    console.error('approveProject error:', err);
    return res.status(500).json({ success: false, message: 'Failed to approve project' });
  }
};

/**
 * POST /api/projects/:id/reject
 * Reject project. Admin only.
 */
const rejectProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const ok = await SheetsService.updateRowById(SHEET_NAME, id, {
      status: 'rejected',
      rejectionReason: rejectionReason || '',
    });
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    return res.json({ success: true, message: 'Project rejected' });
  } catch (err) {
    console.error('rejectProject error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reject project' });
  }
};

module.exports = {
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
};
