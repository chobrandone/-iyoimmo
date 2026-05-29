require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const { supabase } = require('./db');

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://chobrandone.github.io',
  'https://iyoimmobilier.com',
  'https://www.iyoimmobilier.com',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Serve built React frontend (backend/public/) ──────────────────────────────
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/leads',      require('./routes/leads'));
app.use('/api/team',       require('./routes/team'));
app.use('/api/upload',     require('./routes/upload'));
app.use('/api/user',       require('./routes/public-auth'));

// ── Public stats ──────────────────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const [total, available, totalLeads, newLeads, featuredRes] = await Promise.all([
      supabase.from('properties').select('id', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('properties').select('id', { count: 'exact', head: true }).eq('is_published', true).eq('status', 'available'),
      supabase.from('leads').select('id', { count: 'exact', head: true }),
      supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('properties').select('*').eq('is_featured', true).eq('is_published', true).limit(4),
    ]);

    const { normalize } = require('./db');
    res.json({
      totalProperties:     total.count     || 0,
      availableProperties: available.count || 0,
      totalLeads:          totalLeads.count || 0,
      newLeads:            newLeads.count   || 0,
      featuredProperties:  normalize(featuredRes.data || []),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── SPA fallback ──────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  const index = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(index)) {
    res.sendFile(index);
  } else {
    res.json({ status: 'ok', app: 'IYO Immo API', version: '2.0.0' });
  }
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ── Auto-seed check on startup ────────────────────────────────────────────────
async function autoSeed() {
  try {
    const { count } = await supabase
      .from('admin_users')
      .select('id', { count: 'exact', head: true });

    if (count === 0) {
      console.log('📦 No admin users found — please run the SQL seed script in Supabase dashboard.');
      console.log('   Or re-run: node seed.js');
    } else {
      console.log(`👥 Admin users in DB: ${count}`);
    }
  } catch (err) {
    console.error('⚠️  DB check failed:', err.message);
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n✅ IYO Immo API → http://localhost:${PORT}`);
  console.log(`🗄  Database  : Supabase (${process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'check .env'})`);
  await autoSeed();
});
