const jwt = require('jsonwebtoken');
const { supabase, normalize } = require('../db');

/**
 * protect — verifies JWT and attaches req.user + req.userType ('admin' | 'public')
 * Works for both admin users and registered public users.
 */
const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authorized' });

  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const { id, type } = decoded;

    if (type !== 'public') {
      // Check admin_users table first
      const { data } = await supabase
        .from('admin_users').select('*').eq('id', id).eq('is_active', true).single();
      if (data) {
        req.user     = normalize(data);
        req.userType = 'admin';
        return next();
      }
    }

    // Check public_users table
    const { data } = await supabase
      .from('public_users').select('*').eq('id', id).single();
    if (data) {
      req.user     = normalize(data);
      req.userType = 'public';
      return next();
    }

    return res.status(401).json({ message: 'User not found' });
  } catch {
    res.status(401).json({ message: 'Token invalid' });
  }
};

/**
 * adminOnly — use after protect; blocks public users from admin endpoints
 */
const adminOnly = (req, res, next) => {
  if (req.userType !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

module.exports = { protect, adminOnly };
