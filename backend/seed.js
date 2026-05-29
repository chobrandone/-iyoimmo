/**
 * seed.js — exported seed function used by both:
 *   • server.js  (auto-seed on first startup)
 *   • setup.js   (manual: node setup.js)
 */
const bcrypt = require('bcryptjs');
const db     = require('./db');

async function seedDatabase() {
  // Clear all collections
  await Promise.all([
    db.users.removeAsync({}, { multi: true }),
    db.properties.removeAsync({}, { multi: true }),
    db.leads.removeAsync({}, { multi: true }),
    db.team.removeAsync({}, { multi: true }),
  ]);

  // ── Users ────────────────────────────────────────────────────────────────────
  const admin = await db.users.insertAsync({
    name: 'Jerry Beassem',
    email: 'admin@iyoimmo.com',
    password: bcrypt.hashSync('Admin@2026', 10),
    role: 'admin',
    phone: '+236 72 63 71 71',
    isActive: true,
  });

  const agent = await db.users.insertAsync({
    name: 'Jean Mbongo',
    email: 'jean@iyoimmo.com',
    password: bcrypt.hashSync('Agent@2026', 10),
    role: 'agent',
    phone: '+236 72 00 11 22',
    isActive: true,
  });

  // ── Team ─────────────────────────────────────────────────────────────────────
  await db.team.insertAsync([
    { name: 'Jerry Beassem', roleFr: 'Fondateur & Directeur', roleEn: 'Founder & Director', phone: '+236 72 63 71 71', email: 'jerry@iyoimmo.com', order: 1, isActive: true },
    { name: 'Jean Mbongo',   roleFr: 'Agent Senior',          roleEn: 'Senior Agent',       phone: '+236 72 00 11 22', email: 'jean@iyoimmo.com',  order: 2, isActive: true },
    { name: 'Marie Samba',   roleFr: 'Gestion Locative',      roleEn: 'Rental Management',  phone: '+236 72 33 44 55', email: 'marie@iyoimmo.com', order: 3, isActive: true },
  ]);

  // ── Properties ───────────────────────────────────────────────────────────────
  await db.properties.insertAsync([
    {
      refId: 'IYO-2026-042',
      title: { fr: 'Villa moderne 4 chambres avec piscine', en: 'Modern 4-bedroom villa with pool' },
      description: { fr: 'Magnifique villa moderne de 4 chambres à Boy-Rabe. Grande cuisine équipée, suite parentale, jardin avec piscine.', en: 'Stunning modern 4-bedroom villa in Boy-Rabe. Fitted kitchen, master suite, garden with pool.' },
      intent: 'rent', type: 'villa', status: 'available', price: 450000, priceUnit: 'month', neighbourhood: 'Boy-Rabe',
      specs: { bedrooms: 4, bathrooms: 3, area: 220, parking: 2, yearBuilt: 2018 },
      amenities: { airConditioning: true, generator: true, pool: true, security: true, fibreInternet: true, equippedKitchen: true, garden: true, parking: true, waterTank: true },
      nearby: 'Lycée Français · Marché de Boy-Rabe · Pharmacie', isFeatured: true, isPublished: true, agentId: agent._id, views: 284, images: [], coverImage: '',
    },
    {
      refId: 'IYO-2026-018',
      title: { fr: 'Appartement F3 meublé', en: 'Furnished 2-bedroom apartment' },
      description: { fr: 'Appartement F3 lumineux à Lakouanga. 2 chambres, salon spacieux, cuisine séparée, balcon.', en: 'Bright 2-bedroom apartment in Lakouanga. Spacious living room, separate kitchen, balcony.' },
      intent: 'rent', type: 'apartment', status: 'available', price: 220000, priceUnit: 'month', neighbourhood: 'Lakouanga',
      specs: { bedrooms: 2, bathrooms: 1, area: 95, parking: 1 },
      amenities: { airConditioning: true, parking: true, waterTank: true },
      nearby: 'Marché de Lakouanga · Pharmacie · École primaire', isFeatured: true, isPublished: true, agentId: agent._id, views: 156, images: [], coverImage: '',
    },
    {
      refId: 'IYO-2026-031',
      title: { fr: 'Maison familiale 5 chambres', en: '5-bedroom family house' },
      description: { fr: 'Grande maison familiale à Sica 2. 5 chambres, 4 salles de bain, jardin clôturé.', en: 'Large family house in Sica 2. 5 bedrooms, 4 bathrooms, fenced garden.' },
      intent: 'buy', type: 'house', status: 'available', price: 85000000, priceUnit: 'total', neighbourhood: 'Sica 2',
      specs: { bedrooms: 5, bathrooms: 4, area: 320, parking: 2, yearBuilt: 2015 },
      amenities: { airConditioning: true, generator: true, garden: true, parking: true, security: true, waterTank: true },
      nearby: 'École Française · Ambassades', isFeatured: true, isPublished: true, agentId: admin._id, views: 98, images: [], coverImage: '',
    },
    {
      refId: 'IYO-2026-007',
      title: { fr: 'Terrain 800 m² titré', en: 'Titled 800 m² plot' },
      description: { fr: 'Parcelle titrée de 800 m² à Galabadja. Terrain plat, viabilisé. Titre foncier disponible.', en: 'Titled 800 m² plot in Galabadja. Flat serviced land. Title deed available.' },
      intent: 'land', type: 'land', status: 'available', price: 12000000, priceUnit: 'total', neighbourhood: 'Galabadja',
      specs: { bedrooms: 0, bathrooms: 0, area: 800, parking: 0 },
      amenities: {}, nearby: 'Marché central (15 min)', isFeatured: true, isPublished: true, agentId: admin._id, views: 72, images: [], coverImage: '',
    },
    {
      refId: 'IYO-2026-055',
      title: { fr: 'Villa avec piscine — Sica 1', en: 'Villa with pool — Sica 1' },
      description: { fr: 'Somptueuse villa de 5 chambres avec piscine à Sica 1. Résidence sécurisée 24h/24.', en: 'Luxurious 5-bedroom villa with pool in Sica 1. 24/7 secured residence.' },
      intent: 'rent', type: 'villa', status: 'available', price: 680000, priceUnit: 'month', neighbourhood: 'Sica 1',
      specs: { bedrooms: 5, bathrooms: 4, area: 380, parking: 3, yearBuilt: 2020 },
      amenities: { airConditioning: true, generator: true, pool: true, security: true, fibreInternet: true, equippedKitchen: true, garden: true, parking: true, waterTank: true },
      nearby: 'Lycée Français · Ambassades', isFeatured: false, isPublished: true, agentId: agent._id, views: 201, images: [], coverImage: '',
    },
    {
      refId: 'IYO-2026-012',
      title: { fr: 'Studio meublé centre-ville', en: 'Furnished studio city centre' },
      description: { fr: 'Studio entièrement meublé en plein centre de Bangui. Climatisation, accès sécurisé.', en: 'Fully furnished studio in central Bangui. Air conditioning, secured access.' },
      intent: 'rent', type: 'apartment', status: 'reserved', price: 320000, priceUnit: 'month', neighbourhood: 'Centre-ville',
      specs: { bedrooms: 1, bathrooms: 1, area: 45, parking: 0 },
      amenities: { airConditioning: true, furnished: true },
      nearby: 'Marché central · Ministères', isFeatured: false, isPublished: true, agentId: agent._id, views: 43, images: [], coverImage: '',
    },
    {
      refId: 'IYO-2026-038',
      title: { fr: 'Maison 3 ch. avec jardin — Combattant', en: '3-bedroom house with garden — Combattant' },
      description: { fr: 'Belle maison de 3 chambres avec grand jardin clôturé. Groupe électrogène, parking pour 2 véhicules.', en: 'Beautiful 3-bedroom house with large fenced garden. Generator, parking for 2 vehicles.' },
      intent: 'rent', type: 'house', status: 'available', price: 550000, priceUnit: 'month', neighbourhood: 'Combattant',
      specs: { bedrooms: 3, bathrooms: 2, area: 180, parking: 2, yearBuilt: 2017 },
      amenities: { generator: true, waterTank: true, garden: true, parking: true },
      nearby: 'École internationale · Supermarché', isFeatured: false, isPublished: true, agentId: agent._id, views: 67, images: [], coverImage: '',
    },
    {
      refId: 'IYO-2026-003',
      title: { fr: 'F2 lumineux à Galabadja', en: 'Bright F2 in Galabadja' },
      description: { fr: 'Appartement F2 lumineux dans une résidence calme. 1 chambre, salon, cuisine, balcon.', en: 'Bright F2 apartment in a quiet residence. 1 bedroom, living room, kitchen, balcony.' },
      intent: 'rent', type: 'apartment', status: 'available', price: 180000, priceUnit: 'month', neighbourhood: 'Galabadja',
      specs: { bedrooms: 1, bathrooms: 1, area: 70, parking: 0 },
      amenities: { airConditioning: true, waterTank: true },
      nearby: 'Marché de quartier · Pharmacie', isFeatured: false, isPublished: true, agentId: agent._id, views: 29, images: [], coverImage: '',
    },
  ]);

  // ── Sample lead ───────────────────────────────────────────────────────────────
  await db.leads.insertAsync({
    type: 'inquiry', status: 'new',
    name: 'Marie Kouanga', phone: '+33 6 12 34 56 78', email: 'marie.k@gmail.com',
    subject: 'Je cherche à louer',
    message: "Bonjour, je suis intéressée par la villa de Boy-Rabe. Pouvez-vous me donner plus d'informations?",
    channel: 'form', notes: '',
  });

  return { admin, agent };
}

module.exports = seedDatabase;
