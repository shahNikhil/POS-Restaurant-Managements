const express = require('express');
const { createOrder, listOrders, getOrder, updateOrder } = require('../controllers/orderController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', createOrder);
router.get('/', requireAuth, requireRole('staff', 'superadmin'), listOrders);
router.get('/:id', requireAuth, requireRole('staff', 'superadmin'), getOrder);
router.patch('/:id', requireAuth, requireRole('staff', 'superadmin'), updateOrder);

module.exports = router;
