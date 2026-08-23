const express = require('express');
const { login, createStaff, me } = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.get('/me', requireAuth, me);
router.post('/staff', requireAuth, requireRole('superadmin'), createStaff);

module.exports = router;
