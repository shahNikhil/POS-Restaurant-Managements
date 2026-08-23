const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, default: '' },
    tableNumber: { type: String, default: '' },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['cash', 'online'], default: 'cash' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    orderStatus: {
      type: String,
      enum: ['received', 'preparing', 'ready', 'completed', 'cancelled'],
      default: 'received',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
