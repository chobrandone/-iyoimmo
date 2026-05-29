const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { supabase, normalize } = require('../db');
const { protect, adminOnly } = require('../middleware/auth');

// ── Public: team list ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { data } = await supabase.from('team')
    .select('*').eq('is_active', true).order('display_order');
  res.json((normalize(data)||[]).map(m => ({ ...m, role: { fr: m.roleFr, en: m.roleEn } })));
});

// ── Admin: create team member ─────────────────────────────────────────────────
router.post('/', protect, adminOnly, async (req, res) => {
  const b = req.body;
  const { data, error } = await supabase.from('team').insert({
    name:          b.name,
    role_fr:       b.role?.fr || b.role_fr || '',
    role_en:       b.role?.en || b.role_en || '',
    phone:         b.phone    || '',
    email:         b.email    || '',
    photo:         b.photo    || '',
    bio_fr:        b.bio?.fr  || '',
    bio_en:        b.bio?.en  || '',
    display_order: b.order    || 0,
    is_active:     true,
  }).select().single();
  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(normalize(data));
});

// ── Admin: update team member ─────────────────────────────────────────────────
router.patch('/:id', protect, adminOnly, async (req, res) => {
  const b = req.body;
  const u = { updated_at: new Date().toISOString() };
  if (b.name     !== undefined) u.name          = b.name;
  if (b.role?.fr !== undefined) u.role_fr       = b.role.fr;
  if (b.role?.en !== undefined) u.role_en       = b.role.en;
  if (b.role_fr  !== undefined) u.role_fr       = b.role_fr;
  if (b.role_en  !== undefined) u.role_en       = b.role_en;
  if (b.phone    !== undefined) u.phone         = b.phone;
  if (b.email    !== undefined) u.email         = b.email;
  if (b.photo    !== undefined) u.photo         = b.photo;
  if (b.order    !== undefined) u.display_order = b.order;
  if (b.isActive !== undefined) u.is_active     = b.isActive;
  const { data, error } = await supabase.from('team')
    .update(u).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ message: error.message });
  res.json(normalize(data));
});

// ── Admin: delete team member ─────────────────────────────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  await supabase.from('team').delete().eq('id', req.params.id);
  res.json({ message: 'Deleted' });
});

// ── Admin users list ──────────────────────────────────────────────────────────
router.get('/users', protect, async (req, res) => {
  const { data } = await supabase.from('admin_users')
    .select('*').order('created_at', { ascending: false });
  res.json((normalize(data)||[]).map(({ password, ...u }) => u));
});

// ── Admin: create admin user ──────────────────────────────────────────────────
router.post('/users', protect, adminOnly, async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name||!email||!password) return res.status(400).json({ message: 'Name, email, password required' });
  try {
    const { data, error } = await supabase.from('admin_users').insert({
      name, email: email.toLowerCase(),
      password:  bcrypt.hashSync(password, 10),
      role:      role || 'agent',
      phone:     phone || '',
      is_active: true,
    }).select().single();
    if (error) throw error;
    const { password: _, ...safe } = normalize(data);
    res.status(201).json(safe);
  } catch { res.status(400).json({ message: 'Email already exists' }); }
});

// ── Admin: update admin user ──────────────────────────────────────────────────
router.patch('/users/:id', protect, adminOnly, async (req, res) => {
  const { name, phone, role, isActive } = req.body;
  const u = { updated_at: new Date().toISOString() };
  if (name     !== undefined) u.name      = name;
  if (phone    !== undefined) u.phone     = phone;
  if (role     !== undefined) u.role      = role;
  if (isActive !== undefined) u.is_active = isActive;
  const { data, error } = await supabase.from('admin_users')
    .update(u).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ message: error.message });
  const { password, ...safe } = normalize(data);
  res.json(safe);
});

module.exports = router;
