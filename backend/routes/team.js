const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const members = await db.team.findAsync({ isActive: true }).sort({ order: 1 });
  res.json(members.map(m => ({ ...m, role: { fr: m.roleFr, en: m.roleEn } })));
});

router.post('/', protect, adminOnly, async (req, res) => {
  const b = req.body;
  const m = await db.team.insertAsync({
    name: b.name, roleFr: b.role?.fr || b.role_fr || '', roleEn: b.role?.en || b.role_en || '',
    phone: b.phone || '', email: b.email || '', photo: b.photo || '',
    bioFr: b.bio?.fr || '', bioEn: b.bio?.en || '',
    order: b.order || 0, isActive: true,
  });
  res.status(201).json(m);
});

router.patch('/:id', protect, adminOnly, async (req, res) => {
  const b = req.body;
  const update = { $set: {} };
  if (b.name !== undefined) update.$set.name = b.name;
  if (b.role?.fr !== undefined) update.$set.roleFr = b.role.fr;
  if (b.role?.en !== undefined) update.$set.roleEn = b.role.en;
  if (b.role_fr !== undefined) update.$set.roleFr = b.role_fr;
  if (b.role_en !== undefined) update.$set.roleEn = b.role_en;
  if (b.phone !== undefined) update.$set.phone = b.phone;
  if (b.email !== undefined) update.$set.email = b.email;
  if (b.order !== undefined) update.$set.order = b.order;
  if (b.isActive !== undefined) update.$set.isActive = b.isActive;
  await db.team.updateAsync({ _id: req.params.id }, update);
  res.json(await db.team.findOneAsync({ _id: req.params.id }));
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  await db.team.removeAsync({ _id: req.params.id }, {});
  res.json({ message: 'Deleted' });
});

// Users (admin accounts)
router.get('/users', protect, async (req, res) => {
  const users = await db.users.findAsync({}).sort({ createdAt: -1 });
  res.json(users.map(({ password, ...u }) => u));
});

router.post('/users', protect, adminOnly, async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, password required' });
  try {
    const user = await db.users.insertAsync({
      name, email: email.toLowerCase(),
      password: bcrypt.hashSync(password, 12),
      role: role || 'agent', phone: phone || '', isActive: true,
    });
    const { password: _, ...safe } = user;
    res.status(201).json(safe);
  } catch { res.status(400).json({ message: 'Email already exists' }); }
});

router.patch('/users/:id', protect, adminOnly, async (req, res) => {
  const { name, phone, role, isActive } = req.body;
  const update = { $set: {} };
  if (name !== undefined) update.$set.name = name;
  if (phone !== undefined) update.$set.phone = phone;
  if (role !== undefined) update.$set.role = role;
  if (isActive !== undefined) update.$set.isActive = isActive;
  await db.users.updateAsync({ _id: req.params.id }, update);
  const user = await db.users.findOneAsync({ _id: req.params.id });
  const { password, ...safe } = user;
  res.json(safe);
});

module.exports = router;
