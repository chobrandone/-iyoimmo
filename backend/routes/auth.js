const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { supabase, normalize } = require('../db');
const { protect } = require('../middleware/auth');

const signToken = (id, type = 'admin') =>
  jwt.sign({ id, type }, process.env.JWT_SECRET, { expiresIn: '7d' });

const safeUser = ({ password, ...rest }) => rest;

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !data) return res.status(401).json({ message: 'Invalid credentials' });

    const user = normalize(data);
    if (!bcrypt.compareSync(password, user.password))
      return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ token: signToken(user._id), user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json(safeUser(req.user)));

// PATCH /api/auth/me
router.patch('/me', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const { data, error } = await supabase
      .from('admin_users')
      .update({ name, phone, updated_at: new Date().toISOString() })
      .eq('id', req.user._id)
      .select().single();
    if (error) throw error;
    res.json(safeUser(normalize(data)));
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PATCH /api/auth/change-password
router.patch('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!bcrypt.compareSync(currentPassword, req.user.password))
      return res.status(401).json({ message: 'Current password incorrect' });
    if ((newPassword || '').length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    await supabase.from('admin_users')
      .update({ password: bcrypt.hashSync(newPassword, 10), updated_at: new Date().toISOString() })
      .eq('id', req.user._id);
    res.json({ message: 'Password updated' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
