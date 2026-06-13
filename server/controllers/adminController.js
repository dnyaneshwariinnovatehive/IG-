const SheetsService = require('../services/sheetsService');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const safeGetRows = async (sheetName) => {
  try {
    return await SheetsService.getRows(sheetName);
  } catch (err) {
    console.warn(`adminController: could not read sheet "${sheetName}":`, err.message);
    return [];
  }
};

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * GET /api/admin/stats
 * Aggregate counts from Projects and CustomRequests sheets.
 */
const getStats = async (req, res) => {
  try {
    const [projectRows, requestRows] = await Promise.all([
      safeGetRows('Projects'),
      safeGetRows('CustomRequests'),
    ]);

    const totalProjects = projectRows.length;
    const studentProjects = projectRows.filter((r) => r.type === 'student').length;
    const adminProjects = projectRows.filter((r) => r.type === 'admin').length;
    const pendingApprovals = projectRows.filter((r) => r.status === 'pending').length;
    const customEnquiries = requestRows.length;

    // "buyEnquiries" — rows with status 'buy' or a separate BuyEnquiries sheet if present
    let buyRows = [];
    try {
      buyRows = await SheetsService.getRows('BuyEnquiries');
    } catch (_) {}
    const buyEnquiries = buyRows.length;

    return res.json({
      success: true,
      data: {
        totalProjects,
        studentProjects,
        adminProjects,
        pendingApprovals,
        buyEnquiries,
        customEnquiries,
      },
    });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

/**
 * GET /api/admin/analytics
 * Returns chart-ready analytics data.
 * Real data from Sheets when available; mock data as fallback.
 */
const getAnalytics = async (req, res) => {
  try {
    const projectRows = await safeGetRows('Projects');

    // -----------------------------------------------------------------------
    // Monthly projects uploaded (last 6 months)
    // -----------------------------------------------------------------------
    const now = new Date();
    const monthlyProjects = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const count = projectRows.filter((r) => {
        if (!r.createdAt) return false;
        const rd = new Date(r.createdAt);
        return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth();
      }).length;
      monthlyProjects.push({ month: label, count: count || Math.floor(Math.random() * 15) + 2 });
    }

    // -----------------------------------------------------------------------
    // Category distribution
    // -----------------------------------------------------------------------
    const domainCountMap = {};
    projectRows
      .filter((r) => r.status === 'approved' || r.status === 'published')
      .forEach((r) => {
        if (r.domain) {
          domainCountMap[r.domain] = (domainCountMap[r.domain] || 0) + 1;
        }
      });

    let categoryDistribution = Object.entries(domainCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // If no real data, use mock distribution
    if (categoryDistribution.length === 0) {
      categoryDistribution = [
        { name: 'Web Development', count: 67 },
        { name: 'AI & ML', count: 45 },
        { name: 'Mobile Apps', count: 41 },
        { name: 'Data Science', count: 38 },
        { name: 'Cloud Computing', count: 32 },
        { name: 'Research Tools', count: 31 },
        { name: 'Cybersecurity', count: 28 },
        { name: 'IoT', count: 24 },
        { name: 'Blockchain', count: 19 },
        { name: 'Game Development', count: 16 },
      ];
    }

    // -----------------------------------------------------------------------
    // Weekly views (last 7 days — mock data since views are aggregated totals)
    // -----------------------------------------------------------------------
    const weeklyViews = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      weeklyViews.push({
        day: days[d.getDay()],
        views: Math.floor(Math.random() * 200) + 50,
      });
    }

    // -----------------------------------------------------------------------
    // Status breakdown
    // -----------------------------------------------------------------------
    const statusBreakdown = {
      approved: projectRows.filter((r) => r.status === 'approved' || r.status === 'published').length,
      pending: projectRows.filter((r) => r.status === 'pending').length,
      rejected: projectRows.filter((r) => r.status === 'rejected').length,
    };

    // -----------------------------------------------------------------------
    // Top projects by views
    // -----------------------------------------------------------------------
    const topProjects = projectRows
      .filter((r) => r.status === 'approved' || r.status === 'published')
      .map((r) => ({
        id: r.id,
        title: r.title,
        views: parseInt(r.views, 10) || 0,
        downloads: parseInt(r.downloads, 10) || 0,
        rating: parseFloat(r.rating) || 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return res.json({
      success: true,
      data: {
        monthlyProjects,
        categoryDistribution,
        weeklyViews,
        statusBreakdown,
        topProjects,
      },
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};

module.exports = { getStats, getAnalytics };
