/**
 * Seed script for Supabase — only runs if tables are empty.
 * Usage: node seed.js
 *
 * NOTE: Data is already seeded in Supabase via MCP SQL.
 * This script is kept as a reference / re-seed utility.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { supabase } = require('./db');

async function seedDatabase() {
  console.log('🌱 Checking Supabase tables...');

  // Check if admin users exist
  const { count } = await supabase
    .from('admin_users')
    .select('id', { count: 'exact', head: true });

  if (count > 0) {
    console.log(`✅ Already seeded (${count} admin users found). Skipping.`);
    return;
  }

  console.log('📦 Seeding admin users...');
  const { data: adminData, error: adminErr } = await supabase.from('admin_users').insert([
    {
      name:      'Admin IYO',
      email:     'admin@iyoimmo.com',
      password:  bcrypt.hashSync('Admin@2026', 10),
      role:      'admin',
      phone:     '+236 75 00 00 00',
      is_active: true,
    },
    {
      name:      'Jean-Pierre Moïse',
      email:     'jean@iyoimmo.com',
      password:  bcrypt.hashSync('Agent@2026', 10),
      role:      'agent',
      phone:     '+236 75 11 22 33',
      is_active: true,
    },
  ]).select();
  if (adminErr) { console.error('Admin seed error:', adminErr.message); return; }

  console.log('📦 Seeding team members...');
  await supabase.from('team').insert([
    { name: 'Jean-Pierre Moïse', role_fr: 'Directeur Général',  role_en: 'CEO',               phone: '+236 75 11 22 33', email: 'jean@iyoimmo.com',  display_order: 1, is_active: true },
    { name: 'Marie Ndouba',      role_fr: 'Responsable Ventes', role_en: 'Sales Manager',      phone: '+236 75 44 55 66', email: 'marie@iyoimmo.com', display_order: 2, is_active: true },
    { name: 'Paul Koyamba',      role_fr: 'Agent Immobilier',   role_en: 'Real Estate Agent',  phone: '+236 75 77 88 99', email: 'paul@iyoimmo.com',  display_order: 3, is_active: true },
  ]);

  const agentId = adminData[1].id;
  const adminId = adminData[0].id;

  console.log('📦 Seeding sample properties...');
  await supabase.from('properties').insert([
    {
      ref_id: 'IYO-2026-042',
      title: { fr: 'Villa moderne 4 chambres avec piscine', en: 'Modern 4-bedroom villa with pool' },
      description: { fr: 'Magnifique villa moderne de 4 chambres à Boy-Rabe.', en: 'Stunning modern 4-bedroom villa in Boy-Rabe.' },
      intent: 'rent', type: 'villa', status: 'available', price: 450000, price_unit: 'month', neighbourhood: 'Boy-Rabe',
      city: 'Bangui', address: '', specs: { bedrooms: 4, bathrooms: 3, area: 220, parking: 2 },
      amenities: { airConditioning: true, generator: true, pool: true, security: true },
      images: [], cover_image: '', is_featured: true, is_published: true, agent_id: agentId, views: 284,
    },
    {
      ref_id: 'IYO-2026-018',
      title: { fr: 'Appartement F3 meublé', en: 'Furnished 2-bedroom apartment' },
      description: { fr: 'Appartement F3 lumineux à Lakouanga.', en: 'Bright 2-bedroom apartment in Lakouanga.' },
      intent: 'rent', type: 'apartment', status: 'available', price: 220000, price_unit: 'month', neighbourhood: 'Lakouanga',
      city: 'Bangui', address: '', specs: { bedrooms: 2, bathrooms: 1, area: 95, parking: 1 },
      amenities: { airConditioning: true, parking: true },
      images: [], cover_image: '', is_featured: true, is_published: true, agent_id: agentId, views: 156,
    },
    {
      ref_id: 'IYO-2026-031',
      title: { fr: 'Maison familiale 5 chambres', en: '5-bedroom family house' },
      description: { fr: 'Grande maison familiale à Sica 2.', en: 'Large family house in Sica 2.' },
      intent: 'buy', type: 'house', status: 'available', price: 85000000, price_unit: 'total', neighbourhood: 'Sica 2',
      city: 'Bangui', address: '', specs: { bedrooms: 5, bathrooms: 4, area: 320, parking: 2 },
      amenities: { airConditioning: true, generator: true, security: true },
      images: [], cover_image: '', is_featured: true, is_published: true, agent_id: adminId, views: 98,
    },
    {
      ref_id: 'IYO-2026-007',
      title: { fr: 'Terrain 800 m² titré', en: 'Titled 800 m² plot' },
      description: { fr: 'Parcelle titrée de 800 m² à Galabadja.', en: 'Titled 800 m² plot in Galabadja.' },
      intent: 'land', type: 'land', status: 'available', price: 12000000, price_unit: 'total', neighbourhood: 'Galabadja',
      city: 'Bangui', address: '', specs: { bedrooms: 0, bathrooms: 0, area: 800, parking: 0 },
      amenities: {},
      images: [], cover_image: '', is_featured: true, is_published: true, agent_id: adminId, views: 72,
    },
  ]);

  console.log('\n✅ Seed complete!');
  console.log('   Admin:  admin@iyoimmo.com  /  Admin@2026');
  console.log('   Agent:  jean@iyoimmo.com   /  Agent@2026\n');
}

// Run if called directly
if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
}

module.exports = seedDatabase;
