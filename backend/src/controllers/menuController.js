const MenuItem = require('../models/MenuItem');
const fs = require('fs');
const path = require('path');

// GET /api/menu - public, only shows available items
async function listPublicMenu(req, res) {
  const items = await MenuItem.find({ isAvailable: true }).sort({ category: 1, name: 1 });
  res.json(items);
}

// GET /api/menu/all - superadmin, shows everything including unavailable items
async function listAllMenu(req, res) {
  const items = await MenuItem.find().sort({ category: 1, name: 1 });
  res.json(items);
}

// POST /api/menu - superadmin
async function createMenuItem(req, res) {
  const { name, description, price, category, isAvailable } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ message: 'Name and price are required' });
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

  const item = await MenuItem.create({
    name,
    description,
    price: Number(price),
    category,
    isAvailable: isAvailable === undefined ? true : isAvailable === 'true' || isAvailable === true,
    imageUrl,
  });

  res.status(201).json(item);
}

// PUT /api/menu/:id - superadmin
async function updateMenuItem(req, res) {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Menu item not found' });
  }

  const { name, description, price, category, isAvailable } = req.body;
  if (name !== undefined) item.name = name;
  if (description !== undefined) item.description = description;
  if (price !== undefined) item.price = Number(price);
  if (category !== undefined) item.category = category;
  if (isAvailable !== undefined) item.isAvailable = isAvailable === 'true' || isAvailable === true;

  if (req.file) {
    if (item.imageUrl) {
      const oldPath = path.join(__dirname, '..', '..', item.imageUrl.replace('/uploads/', 'uploads/'));
      fs.unlink(oldPath, () => {});
    }
    item.imageUrl = `/uploads/${req.file.filename}`;
  }

  await item.save();
  res.json(item);
}

// DELETE /api/menu/:id - superadmin
async function deleteMenuItem(req, res) {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Menu item not found' });
  }

  if (item.imageUrl) {
    const filePath = path.join(__dirname, '..', '..', item.imageUrl.replace('/uploads/', 'uploads/'));
    fs.unlink(filePath, () => {});
  }

  res.json({ message: 'Menu item deleted' });
}

module.exports = { listPublicMenu, listAllMenu, createMenuItem, updateMenuItem, deleteMenuItem };
