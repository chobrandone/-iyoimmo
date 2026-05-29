/**
 * IYO Immo — Firebase seed script
 * Run once after deploying: node setup.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

async function setup() {
  console.log('\n🚀 Setting up IYO Immo database on Firebase...\n');

  // Clear existing data
  await Promise.all([
    clearCollection('users'),
    clearCollection('properties'),
    clearCollection('leads'),
    clearCollection('team'),
  ]);
  console.log('🗑  Cleared existing collections');

  // ── Users ──────────────────────────────────────────────────────────────────
  const admin = await db.users.insertAsync({
    name: 'Jerry Beassem', email: 'admin@iyoimmo.com',
    password: bcrypt.hashSync('Admin@2026', 12),
    role: 'admin', phone: '+236 72 63 71 71', isActive: true,
  });
  const agent = await db.users.insertAsync({
    name: 'Jean Mbongo', email: 'jean@iyoimmo.com',
    password: bcrypt.hashSync('Agent@2026', 12),
    role: 'agent', phone: '+236 72 00 11 22', isActive: true,
  });
  console.log('👤 Users created');

  // ── Team ───────────────────────────────────────────────────────────────────
  await db.team.insertAsync([
    { name: 'Jerry Beassem', roleFr: 'Fondateur & Directeur', roleEn: 'Founder & Director', phone: '+236 72 63 71 71', email: 'jerry@iyoimmo.com', order: 1, isActive: true },
    { name: 'Jean Mbongo',   roleFr: 'Agent Senior',          roleEn: 'Senior Agent',       phone: '+236 72 00 11 22', email: 'jean@iyoimmo.com',  order: 2, isActive: true },
    { name: 'Marie Samba',   roleFr: 'Gestion Locative',      roleEn: 'Rental Management',  phone: '+236 72 33 44 55', email: 'marie@iyoimmo.com', order: 3, isActive: true },
  ]);
  console.log('👥 Team created');

  // ── Properties ─────────────────────────────────────────────────────────────
  const properties = [
    {
      refId: 'IYO-2026-042',
      title: { fr: 'Villa moderne 4 chambres avec piscine', en: 'Modern 4-bedroom villa with pool' },
      description: {
        fr: "Magnifique villa moderne de 4 chambres située dans un quartier sécurisé de Boy-Rabe, à 10 min du centre-ville. Grande cuisine équipée, suite parentale, jardin avec piscine. Disponible immédiatement.",
        en: "Stunning modern 4-bedroom villa in a secure Boy-Rabe neighbourhood, 10 minutes from downtown. Fitted kitchen, master suite, garden with pool. Available immediately.",
      },
      intent: 'rent', type: 'villa', status: 'available',
      price: 450000, priceUnit: 'month', neighbourhood: 'Boy-Rabe',
      specs: { bedrooms: 4, bathrooms: 3, area: 220, parking: 2, yearBuilt: 2018 },
      amenities: { airConditioning: true, generator: true, pool: true, security: true, fibreInternet: true, equippedKitchen: true, garden: true, parking: true, waterTank: true },
      nearby: 'Lycée Français · Marché de Boy-Rabe · Pharmacie · Ambassade de France (12 min)',
      isFeatured: true, isPublished: true, agentId: agent._id, views: 284,
      images: [], coverImage: '',
    },
    {
      refId: 'IYO-2026-018',
      title: { fr: 'Appartement F3 meublé', en: 'Furnished 2-bedroom apartment' },
      description: {
        fr: "Appartement F3 lumineux au 2ème étage à Lakouanga. 2 chambres, salon spacieux, cuisine séparée, balcon. Eau courante, électricité stable, parking sécurisé.",
        en: "Bright 2-bedroom apartment on the 2nd floor in Lakouanga. Spacious living room, separate kitchen, balcony. Running water, stable electricity, secure parking.",
      },
      intent: 'rent', type: 'apartment', status: 'available',
      price: 220000, priceUnit: 'month', neighbourhood: 'Lakouanga',
      specs: { bedrooms: 2, bathrooms: 1, area: 95, parking: 1 },
      amenities: { airConditioning: true, parking: true, waterTank: true },
      nearby: 'Marché de Lakouanga · Pharmacie · École primaire (5 min)',
      isFeatured: true, isPublished: true, agentId: agent._id, views: 156,
      images: [], coverImage: '',
    },
    {
      refId: 'IYO-2026-031',
      title: { fr: 'Maison familiale 5 chambres', en: '5-bedroom family house' },
      description: {
        fr: "Grande maison familiale à Sica 2. 5 chambres, 4 salles de bain, grand salon, jardin clôturé, groupe électrogène inclus.",
        en: "Large family house in Sica 2. 5 bedrooms, 4 bathrooms, large living room, fenced garden, generator included.",
      },
      intent: 'buy', type: 'house', status: 'available',
      price: 85000000, priceUnit: 'total', neighbourhood: 'Sica 2',
      specs: { bedrooms: 5, bathrooms: 4, area: 320, parking: 2, yearBuilt: 2015 },
      amenities: { airConditioning: true, generator: true, garden: true, parking: true, security: true, waterTank: true },
      nearby: 'École Française · Ambassades · Centre commercial',
      isFeatured: true, isPublished: true, agentId: admin._id, views: 98,
      images: [], coverImage: '',
    },
    {
      refId: 'IYO-2026-007',
      title: { fr: 'Terrain 800 m² titré', en: 'Titled 800 m² plot' },
      description: {
        fr: "Parcelle titrée de 800 m² à Galabadja. Terrain plat, viabilisé. Titre foncier disponible. À 15 min du marché central.",
        en: "Titled 800 m² plot in Galabadja. Flat serviced land. Title deed available. 15 minutes from the central market.",
      },
      intent: 'land', type: 'land', status: 'available',
      price: 12000000, priceUnit: 'total', neighbourhood: 'Galabadja',
      specs: { bedrooms: 0, bathrooms: 0, area: 800, parking: 0 },
      amenities: {},
      nearby: 'Marché central (15 min) · Route principale',
      isFeatured: true, isPublished: true, agentId: admin._id, views: 72,
      images: [], coverImage: '',
    },
    {
      refId: 'IYO-2026-055',
      title: { fr: 'Villa avec piscine — Sica 1', en: 'Villa with pool — Sica 1' },
      description: {
        fr: "Somptueuse villa de 5 chambres avec piscine à Sica 1. Finitions de qualité, cuisine américaine, résidence sécurisée 24h/24.",
        en: "Luxurious 5-bedroom villa with pool in Sica 1. Quality finishes, open-plan kitchen, 24/7 secured residence.",
      },
      intent: 'rent', type: 'villa', status: 'available',
      price: 680000, priceUnit: 'month', neighbourhood: 'Sica 1',
      specs: { bedrooms: 5, bathrooms: 4, area: 380, parking: 3, yearBuilt: 2020 },
      amenities: { airConditioning: true, generator: true, pool: true, security: true, fibreInternet: true, equippedKitchen: true, garden: true, parking: true, waterTank: true },
      nearby: 'Lycée Français · Ambassades · Hôtel Ledger (10 min)',
      isFeatured: false, isPublished: true, agentId: agent._id, views: 201,
      images: [], coverImage: '',
    },
    {
      refId: 'IYO-2026-012',
      title: { fr: 'Studio meublé centre-ville', en: 'Furnished studio city centre' },
      description: {
        fr: "Studio entièrement meublé en plein centre de Bangui. Tout équipé : literie, cuisine fonctionnelle, climatisation. Accès sécurisé.",
        en: "Fully furnished studio in central Bangui. Fully equipped: bedding, kitchen, air conditioning. Secured access.",
      },
      intent: 'rent', type: 'apartment', status: 'reserved',
      price: 320000, priceUnit: 'month', neighbourhood: 'Centre-ville',
      specs: { bedrooms: 1, bathrooms: 1, area: 45, parking: 0 },
      amenities: { airConditioning: true, furnished: true },
      nearby: 'Marché central · Ministères · Restaurant Le Relais (5 min)',
      isFeatured: false, isPublished: true, agentId: agent._id, views: 43,
      images: [], coverImage: '',
    },
    {
      refId: 'IYO-2026-038',
      title: { fr: 'Maison 3 ch. avec jardin — Combattant', en: '3-bedroom house with garden — Combattant' },
      description: {
        fr: "Belle maison de 3 chambres avec grand jardin clôturé au quartier Combattant. Groupe électrogène, réservoir d'eau, parking pour 2 véhicules.",
        en: "Beautiful 3-bedroom house with a large fenced garden in Combattant. Generator, water tank, parking for 2 vehicles.",
      },
      intent: 'rent', type: 'house', status: 'available',
      price: 550000, priceUnit: 'month', neighbourhood: 'Combattant',
      specs: { bedrooms: 3, bathrooms: 2, area: 180, parking: 2, yearBuilt: 2017 },
      amenities: { generator: true, waterTank: true, garden: true, parking: true },
      nearby: 'École internationale · Supermarché · Clinique (8 min)',
      isFeatured: false, isPublished: true, agentId: agent._id, views: 67,
      images: [], coverImage: '',
    },
    {
      refId: 'IYO-2026-003',
      title: { fr: 'F2 lumineux à Galabadja', en: 'Bright F2 in Galabadja' },
      description: {
        fr: "Appartement F2 lumineux dans une résidence calme de Galabadja. 1 chambre, salon, cuisine, balcon. Eau et électricité stables.",
        en: "Bright F2 apartment in a quiet Galabadja residence. 1 bedroom, living room, kitchen, balcony. Stable water and electricity.",
      },
      intent: 'rent', type: 'apartment', status: 'available',
      price: 180000, priceUnit: 'month', neighbourhood: 'Galabadja',
      specs: { bedrooms: 1, bathrooms: 1, area: 70, parking: 0 },
      amenities: { airConditioning: true, waterTank: true },
      nearby: 'Marché de quartier · Pharmacie · Transport en commun',
      isFeatured: false, isPublished: true, agentId: agent._id, views: 29,
      images: [], coverImage: '',
    },
  ];

  await db.properties.insertAsync(properties);
  console.log(`🏡 ${properties.length} properties created`);

  // Sample lead
  await db.leads.insertAsync({
    type: 'inquiry', status: 'new',
    name: 'Marie Kouanga', phone: '+33 6 12 34 56 78', email: 'marie.k@gmail.com',
    subject: 'Je cherche à louer',
    message: "Bonjour, je suis intéressée par la villa de Boy-Rabe. Pouvez-vous me donner plus d'informations?",
    channel: 'form', notes: '',
  });
  console.log('💬 Sample lead created');

  console.log(`
╔══════════════════════════════════════════════╗
║     ✅  IYO Immo Firebase Setup Complete!    ║
╠══════════════════════════════════════════════╣
║  Admin:  admin@iyoimmo.com / Admin@2026      ║
║  Agent:  jean@iyoimmo.com  / Agent@2026      ║
╠══════════════════════════════════════════════╣
║  Next:  node server.js                       ║
╚══════════════════════════════════════════════╝
`);
  process.exit(0);
}

/** Delete all docs in a Firestore collection (batch delete) */
async function clearCollection(name) {
  const { admin } = require('./db');
  const col  = admin.firestore().collection(name);
  const snap = await col.get();
  const batch = admin.firestore().batch();
  snap.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}

setup().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
