const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// POST /api/orders - public, placed from the menu page
async function createOrder(req, res) {
  const { customerName, tableNumber, items, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order must include at least one item' });
  }

  const menuItemIds = items.map((i) => i.menuItemId);
  const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });
  const menuItemMap = new Map(menuItems.map((m) => [m._id.toString(), m]));

  let total = 0;
  const orderItems = items.map((i) => {
    const menuItem = menuItemMap.get(i.menuItemId);
    if (!menuItem) {
      throw Object.assign(new Error(`Menu item ${i.menuItemId} not found`), { status: 400 });
    }
    const quantity = Number(i.quantity) || 1;
    total += menuItem.price * quantity;
    return {
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
    };
  });

  // Online payment status is a placeholder until the payment gateway is wired up.
  const order = await Order.create({
    customerName,
    tableNumber,
    items: orderItems,
    total,
    paymentMethod: paymentMethod === 'online' ? 'online' : 'cash',
    paymentStatus: 'pending',
  });

  res.status(201).json(order);
}

// GET /api/orders - staff/superadmin
async function listOrders(req, res) {
  const { status } = req.query;
  const filter = status ? { orderStatus: status } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json(orders);
}

// GET /api/orders/:id - staff/superadmin
async function getOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.json(order);
}

// PATCH /api/orders/:id - staff/superadmin, update order/payment status
async function updateOrder(req, res) {
  const { orderStatus, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  await order.save();
  res.json(order);
}

module.exports = { createOrder, listOrders, getOrder, updateOrder };
