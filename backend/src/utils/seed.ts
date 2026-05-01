import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User';

const seeds = [
  { name: 'Admin User', email: 'admin@lms.com', password: 'Admin@123', role: 'admin' },
  { name: 'Sales Executive', email: 'sales@lms.com', password: 'Sales@123', role: 'sales' },
  { name: 'Sanction Executive', email: 'sanction@lms.com', password: 'Sanction@123', role: 'sanction' },
  { name: 'Disbursement Executive', email: 'disburse@lms.com', password: 'Disburse@123', role: 'disbursement' },
  { name: 'Collection Executive', email: 'collection@lms.com', password: 'Collect@123', role: 'collection' },
  { name: 'Test Borrower', email: 'borrower@lms.com', password: 'Borrower@123', role: 'borrower' },
] as const;

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  for (const s of seeds) {
    const existing = await User.findOne({ email: s.email });
    if (existing) {
      console.log(`⏭  Skipping ${s.email} (already exists)`);
      continue;
    }
    await User.create(s);
    console.log(`✅ Created ${s.role}: ${s.email} / ${s.password}`);
  }

  console.log('\n🎉 Seed complete!\n');
  console.log('LOGIN CREDENTIALS:');
  seeds.forEach((s) => console.log(`  ${s.role.padEnd(15)} ${s.email.padEnd(30)} ${s.password}`));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
