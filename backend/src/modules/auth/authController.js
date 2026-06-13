const jwt = require('jsonwebtoken');
const config = require('../../config');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (
      email.trim().toLowerCase() !== config.admin.email.toLowerCase() ||
      password !== config.admin.password
    ) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const payload = { id: 'admin', email: email.trim().toLowerCase(), role: 'admin' };
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

    return res.json({
      success: true,
      token,
      user: {
        id: 'admin',
        email: email.trim().toLowerCase(),
        role: 'admin',
        name: 'Admin User',
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const logout = (req, res) => {
  return res.json({ success: true, message: 'Logged out' });
};

const getMe = (req, res) => {
  return res.json({
    success: true,
    token: null,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      name: 'Admin User',
    },
  });
};

module.exports = { login, logout, getMe };
