const SheetsService = require('../../integrations/sheetsService');

const CATEGORIES = [
  { id: '1', name: 'AI & ML', slug: 'ai-ml', icon: '🤖', count: 45, color: 'blue', description: 'Artificial Intelligence and Machine Learning projects' },
  { id: '2', name: 'Cybersecurity', slug: 'cybersecurity', icon: '🔒', count: 28, color: 'red', description: 'Security tools and systems' },
  { id: '3', name: 'Cloud Computing', slug: 'cloud', icon: '☁️', count: 32, color: 'sky', description: 'Cloud-based solutions' },
  { id: '4', name: 'Web Development', slug: 'web-dev', icon: '🌐', count: 67, color: 'violet', description: 'Full-stack web applications' },
  { id: '5', name: 'Mobile Apps', slug: 'mobile', icon: '📱', count: 41, color: 'green', description: 'iOS and Android applications' },
  { id: '6', name: 'Data Science', slug: 'data-science', icon: '📊', count: 38, color: 'amber', description: 'Data analysis and visualization' },
  { id: '7', name: 'Blockchain', slug: 'blockchain', icon: '⛓️', count: 19, color: 'orange', description: 'Blockchain and Web3 projects' },
  { id: '8', name: 'IoT', slug: 'iot', icon: '🔌', count: 24, color: 'teal', description: 'Internet of Things solutions' },
  { id: '9', name: 'Research Tools', slug: 'research', icon: '🔬', count: 31, color: 'purple', description: 'Academic research tools' },
  { id: '10', name: 'Game Development', slug: 'games', icon: '🎮', count: 16, color: 'pink', description: 'Games and simulations' },
];

const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/&/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const getCategories = async (req, res) => {
  try {
    const categories = CATEGORIES.map((c) => ({ ...c }));

    try {
      const rows = await SheetsService.getRows('Projects');
      if (rows && rows.length > 0) {
        const approved = rows.filter(
          (r) => r.status === 'approved' || r.status === 'published'
        );

        categories.forEach((c) => { c.count = 0; });

        approved.forEach((row) => {
          if (!row.domain) return;
          const domainSlug = slugify(row.domain);
          const match = categories.find(
            (c) => c.slug === domainSlug || slugify(c.name) === domainSlug
          );
          if (match) match.count += 1;
        });
      }
    } catch (sheetErr) {
      console.warn('categoryController: could not refresh counts from Sheets:', sheetErr.message);
    }

    return res.json({ success: true, data: categories });
  } catch (err) {
    console.error('getCategories error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

module.exports = { getCategories };
