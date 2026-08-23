require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');

// One-time script to create the first superadmin account.
// Run with: npm run seed
async function seed() {
  await connectDB();

  const email = (process.env.SUPERADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME || 'Super Admin';

  if (!email || !password) {
    console.error('Set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD in .env before seeding');
    process.exit(1);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Superadmin ${email} already exists, skipping.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ name, email, passwordHash, role: 'superadmin' });

  console.log(`Superadmin created: ${email}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
