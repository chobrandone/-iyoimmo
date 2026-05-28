require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');
const TeamMember = require('./models/TeamMember');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Property.deleteMany(), TeamMember.deleteMany()]);
  console.log('🗑  Cleared existing data');

  // Create admin user
  const admin = await User.create({
    name: 'Jerry Beassem',
    email: 'admin@iyoimmo.com',
    password: 'Admin@2026',
    role: 'admin',
    phone: '+236 72 63 71 71',
  });

  const agent = await User.create({
    name: 'Jean Mbongo',
    email: 'jean@iyoimmo.com',
    password: 'Agent@2026',
    role: 'agent',
    phone: '+236 72 00 11 22',
  });

  console.log('👤 Users created');

  // Create team members
  await TeamMember.insertMany([
    {
      name: 'Jerry Beassem',
      role: { fr: 'Fondateur & Directeur', en: 'Founder & Director' },
      phone: '+236 72 63 71 71',
      email: 'jerry@iyoimmo.com',
      order: 1,
    },
    {
      name: 'Jean Mbongo',
      role: { fr: 'Agent Senior', en: 'Senior Agent' },
      phone: '+236 72 00 11 22',
      email: 'jean@iyoimmo.com',
      order: 2,
    },
    {
      name: 'Marie Samba',
      role: { fr: 'Gestion Locative', en: 'Rental Management' },
      phone: '+236 72 33 44 55',
      email: 'marie@iyoimmo.com',
      order: 3,
    },
  ]);

  console.log('👥 Team members created');

  const properties = [
    {
      title: { fr: 'Villa moderne 4 chambres avec piscine', en: 'Modern 4-bedroom villa with pool' },
      description: {
        fr: "Magnifique villa moderne de 4 chambres située dans un quartier sécurisé de Boy-Rabe, à 10 min du centre-ville. La maison comprend un grand salon-séjour ouvert sur la cuisine équipée, une suite parentale avec dressing et salle de bain privative, ainsi qu'un beau jardin avec piscine.",
        en: 'Stunning modern 4-bedroom villa in a secure Boy-Rabe neighbourhood, 10 minutes from downtown. Features open-plan living with fitted kitchen, master suite, and garden with pool.',
      },
      intent: 'rent', type: 'villa', status: 'available',
      price: 450000, priceUnit: 'month', neighbourhood: 'Boy-Rabe',
      specs: { bedrooms: 4, bathrooms: 3, area: 220, parking: 2, yearBuilt: 2018 },
      amenities: { airConditioning: true, generator: true, pool: true, security: true, fibreInternet: true, equippedKitchen: true, garden: true, parking: true, waterTank: true },
      isFeatured: true, isPublished: true, agent: agent._id,
      nearby: 'Lycée Français · Marché de Boy-Rabe · Pharmacie · Ambassade de France (12 min)',
    },
    {
      title: { fr: 'Appartement F3 meublé', en: 'Furnished 2-bedroom apartment' },
      description: {
        fr: "Appartement F3 lumineux au 2ème étage d'un immeuble résidentiel calme à Lakouanga. 2 chambres, salon spacieux, cuisine séparée, balcon.",
        en: 'Bright 2-bedroom apartment on the 2nd floor in Lakouanga. Spacious living room, separate kitchen, balcony. Running water, stable electricity.',
      },
      intent: 'rent', type: 'apartment', status: 'available',
      price: 220000, priceUnit: 'month', neighbourhood: 'Lakouanga',
      specs: { bedrooms: 2, bathrooms: 1, area: 95, parking: 1 },
      amenities: { airConditioning: true, parking: true, waterTank: true },
      isFeatured: true, isPublished: true, agent: agent._id,
    },
    {
      title: { fr: 'Maison familiale 5 chambres', en: '5-bedroom family house' },
      description: {
        fr: 'Grande maison familiale dans le quartier résidentiel de Sica 2. 5 chambres, 4 salles de bain, grand salon, jardin clôturé.',
        en: 'Large family house in residential Sica 2. 5 bedrooms, 4 bathrooms, fenced garden, generator included.',
      },
      intent: 'buy', type: 'house', status: 'available',
      price: 85000000, priceUnit: 'total', neighbourhood: 'Sica 2',
      specs: { bedrooms: 5, bathrooms: 4, area: 320, parking: 2, yearBuilt: 2015 },
      amenities: { airConditioning: true, generator: true, garden: true, parking: true, security: true, waterTank: true },
      isFeatured: true, isPublished: true, agent: admin._id,
    },
    {
      title: { fr: 'Terrain 800 m² titré', en: 'Titled 800 m² plot' },
      description: {
        fr: "Parcelle titrée de 800 m² à Galabadja, terrain plat, viabilisé. Idéal pour construction. Titre foncier disponible. À 15 min du marché central.",
        en: 'Titled 800 m² plot in Galabadja, flat serviced land. Ideal for building. Title deed available. 15 minutes from central market.',
      },
      intent: 'land', type: 'land', status: 'available',
      price: 12000000, priceUnit: 'total', neighbourhood: 'Galabadja',
      specs: { bedrooms: 0, bathrooms: 0, area: 800 },
      amenities: {},
      isFeatured: true, isPublished: true, agent: admin._id,
    },
    {
      title: { fr: 'Villa avec piscine — Sica 1', en: 'Villa with pool — Sica 1' },
      description: {
        fr: 'Somptueuse villa de 5 chambres avec piscine à Sica 1. Finitions de qualité, cuisine américaine, résidence sécurisée 24h/24.',
        en: 'Luxurious 5-bedroom villa with pool in Sica 1. Quality finishes, open-plan kitchen, 24/7 secured residence.',
      },
      intent: 'rent', type: 'villa', status: 'available',
      price: 680000, priceUnit: 'month', neighbourhood: 'Sica 1',
      specs: { bedrooms: 5, bathrooms: 4, area: 380, parking: 3, yearBuilt: 2020 },
      amenities: { airConditioning: true, generator: true, pool: true, security: true, fibreInternet: true, equippedKitchen: true, garden: true, parking: true, waterTank: true },
      isFeatured: false, isPublished: true, agent: agent._id,
    },
    {
      title: { fr: 'Studio meublé centre-ville', en: 'Furnished studio city centre' },
      description: {
        fr: 'Studio entièrement meublé en plein centre de Bangui. Idéal pour professionnel ou étudiant. Tout équipé : literie, cuisine, climatisation.',
        en: 'Fully furnished studio in central Bangui. Ideal for a professional or student. Fully equipped: bedding, kitchen, air conditioning.',
      },
      intent: 'rent', type: 'apartment', status: 'reserved',
      price: 320000, priceUnit: 'month', neighbourhood: 'Centre-ville',
      specs: { bedrooms: 1, bathrooms: 1, area: 45 },
      amenities: { airConditioning: true, furnished: true },
      isFeatured: false, isPublished: true, agent: agent._id,
    },
  ];

  for (const p of properties) {
    await Property.create(p);
  }

  console.log('🏡 Properties created');
  console.log('\n=== ✅ SEED COMPLETE ===');
  console.log('Admin:  admin@iyoimmo.com  /  Admin@2026');
  console.log('Agent:  jean@iyoimmo.com   /  Agent@2026');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
