const router = require('express').Router();
const db = require('../db');
const { protect, adminOnly } = require('../middleware/auth');

const genRef = () => `IYO-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`;

const buildQuery = (q) => {
  const filter = { isPublished: true };
  if (q.intent) filter.intent = q.intent;
  if (q.type) filter.type = q.type;
  if (q.status) filter.status = q.status;
  if (q.neighbourhood) filter.neighbourhood = new RegExp(q.neighbourhood, 'i');
  if (q.featured === 'true') filter.isFeatured = true;
  if (q.bedrooms) filter['specs.bedrooms'] = { $gte: parseInt(q.bedrooms) };
  if (q.minPrice || q.maxPrice) {
    filter.price = {};
    if (q.minPrice) filter.price.$gte = parseFloat(q.minPrice);
    if (q.maxPrice) filter.price.$lte = parseFloat(q.maxPrice);
  }
  if (q.amenities) {
    q.amenities.split(',').forEach(k => { filter[`amenities.${k}`] = true; });
  }
  return filter;
};

const sortMap = {
  '-createdAt': { createdAt: -1 }, 'price': { price: 1 },
  '-price': { price: -1 }, '-specs.area': { 'specs.area': -1 },
};

// Public: list
router.get('/', async (req, res) => {
  try {
    const filter = buildQuery(req.query);
    const sort = sortMap[req.query.sort] || { createdAt: -1 };
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const [all, properties] = await Promise.all([
      db.properties.findAsync(filter),
      db.properties.findAsync(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    ]);
    const propertiesWithAgent = await Promise.all(properties.map(async (p) => {
      const agent = p.agentId ? await db.users.findOneAsync({ _id: p.agentId }) : null;
      return { ...p, agent: agent ? { _id: agent._id, id: agent._id, name: agent.name, phone: agent.phone, email: agent.email } : null };
    }));
    res.json({ properties: propertiesWithAgent, total: all.length, page, pages: Math.ceil(all.length / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Public: single
router.get('/:id', async (req, res) => {
  try {
    const p = await db.properties.findOneAsync({ _id: req.params.id });
    if (!p) return res.status(404).json({ message: 'Property not found' });
    await db.properties.updateAsync({ _id: req.params.id }, { $inc: { views: 1 } });
    const agent = p.agentId ? await db.users.findOneAsync({ _id: p.agentId }) : null;
    res.json({ ...p, agent: agent ? { _id: agent._id, name: agent.name, phone: agent.phone, email: agent.email, avatar: agent.avatar } : null });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Public: similar
router.get('/:id/similar', async (req, res) => {
  try {
    const p = await db.properties.findOneAsync({ _id: req.params.id });
    if (!p) return res.status(404).json([]);
    const similar = await db.properties.findAsync({ _id: { $ne: req.params.id }, intent: p.intent, neighbourhood: p.neighbourhood, isPublished: true, status: 'available' }).limit(3);
    res.json(similar);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: all
router.get('/admin/all', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.intent) filter.intent = req.query.intent;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const all = await db.properties.findAsync(filter);
    const properties = await db.properties.findAsync(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const withAgent = await Promise.all(properties.map(async (p) => {
      const agent = p.agentId ? await db.users.findOneAsync({ _id: p.agentId }) : null;
      return { ...p, agent: agent ? { _id: agent._id, name: agent.name } : null };
    }));
    res.json({ properties: withAgent, total: all.length, page, pages: Math.ceil(all.length / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: create
router.post('/', protect, async (req, res) => {
  try {
    const b = req.body;
    const doc = {
      refId: genRef(),
      title: b.title || { fr: '', en: '' },
      description: b.description || { fr: '', en: '' },
      intent: b.intent || 'rent', type: b.type || 'apartment', status: b.status || 'available',
      price: parseFloat(b.price) || 0, priceUnit: b.priceUnit || 'month',
      neighbourhood: b.neighbourhood || '', address: b.address || '', city: b.city || 'Bangui',
      specs: b.specs || { bedrooms: 0, bathrooms: 0, area: null, parking: 0, yearBuilt: null },
      amenities: b.amenities || {},
      images: b.images || [], coverImage: b.coverImage || '',
      nearby: b.nearby || '',
      isFeatured: !!b.isFeatured, isPublished: b.isPublished !== false,
      agentId: b.agent || req.user._id,
      views: 0,
    };
    const created = await db.properties.insertAsync(doc);
    res.status(201).json(created);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Admin: update
router.patch('/:id', protect, async (req, res) => {
  try {
    const b = req.body;
    const update = { $set: {} };
    const fields = ['title', 'description', 'intent', 'type', 'status', 'price', 'priceUnit', 'neighbourhood', 'address', 'specs', 'amenities', 'images', 'coverImage', 'nearby', 'isFeatured', 'isPublished'];
    fields.forEach(f => { if (b[f] !== undefined) update.$set[f] = b[f]; });
    if (b.agent !== undefined) update.$set.agentId = b.agent;
    await db.properties.updateAsync({ _id: req.params.id }, update);
    res.json(await db.properties.findOneAsync({ _id: req.params.id }));
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Admin: delete
router.delete('/:id', protect, adminOnly, async (req, res) => {
  await db.properties.removeAsync({ _id: req.params.id }, {});
  res.json({ message: 'Property deleted' });
});

module.exports = router;
