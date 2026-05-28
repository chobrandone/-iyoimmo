const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { protect } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const safeUser = (u) => { const { password, ...rest } = u; return rest; };

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await db.users.findOneAsync({ email: email.toLowerCase(), isActive: true });
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: signToken(user._id), user: safeUser(user) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/me', protect, (req, res) => res.json(safeUser(req.user)));

router.patch('/me', protect, async (req, res) => {
  const { name, phone } = req.body;
  await db.users.updateAsync({ _id: req.user._id }, { $set: { name, phone } });
  const user = await db.users.findOneAsync({ _id: req.user._id });
  res.json(safeUser(user));
});

router.patch('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!bcrypt.compareSync(currentPassword, req.user.password))
    return res.status(401).json({ message: 'Current password incorrect' });
  if ((newPassword || '').length < 8)
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  await db.users.updateAsync({ _id: req.user._id }, { $set: { password: bcrypt.hashSync(newPassword, 12) } });
  res.json({ message: 'Password updated' });
});

module.exports = router;
