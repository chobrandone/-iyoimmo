/**
 * Public user auth — anyone can register and log in.
 * These accounts let visitors track their submissions and upload files.
 */
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { supabase, normalize } = require('../db');
const { protect } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id, type: 'public' }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/user/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const { data, error } = await supabase.from('public_users').insert({
      name,
      email:    email.toLowerCase().trim(),
      password: bcrypt.hashSync(password, 10),
      phone:    phone || '',
    }).select().single();

    if (error) {
      if (error.code === '23505') return res.status(400).json({ message: 'Email already registered' });
      throw error;
    }

    const user = normalize(data);
    const { password: _, ...safe } = user;
    res.status(201).json({ token: signToken(user._id), user: safe });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// POST /api/user/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const { data, error } = await supabase.from('public_users')
      .select('*').eq('email', email.toLowerCase().trim()).single();

    if (error || !data) return res.status(401).json({ message: 'Invalid credentials' });

    const user = normalize(data);
    if (!bcrypt.compareSync(password, user.password))
      return res.status(401).json({ message: 'Invalid credentials' });

    const { password: _, ...safe } = user;
    res.json({ token: signToken(user._id), user: safe });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/user/me  — current user profile
router.get('/me', protect, (req, res) => {
  if (req.userType !== 'public') return res.status(403).json({ message: 'Not a public user account' });
  const { password, ...safe } = req.user;
  res.json(safe);
});

// GET /api/user/my-submissions  — leads submitted by this user
router.get('/my-submissions', protect, async (req, res) => {
  if (req.userType !== 'public') return res.status(403).json({ message: 'Not a public user account' });
  const { data } = await supabase.from('leads')
    .select('*').eq('public_user_id', req.user._id).order('created_at', { ascending: false });
  res.json(normalize(data||[]));
});

module.exports = router;
