const express = require('express');
const {
  listPublicMenu,
  listAllMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', listPublicMenu);
router.get('/all', requireAuth, requireRole('superadmin'), listAllMenu);
router.post('/', requireAuth, requireRole('superadmin'), upload.single('image'), createMenuItem);
router.put('/:id', requireAuth, requireRole('superadmin'), upload.single('image'), updateMenuItem);
router.delete('/:id', requireAuth, requireRole('superadmin'), deleteMenuItem);

module.exports = router;
