const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/login
// Used by both staff and superadmin - the role on the user record decides access.
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

// POST /api/auth/staff
// Superadmin-only: create a staff account.
async function createStaff(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ message: 'A user with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    role: 'staff',
  });

  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
}

// GET /api/auth/me
async function me(req, res) {
  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
}

module.exports = { login, createStaff, me };
