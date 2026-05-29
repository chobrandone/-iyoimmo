require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const db      = require('./db');

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://chobrandone.github.io',
  process.env.FRONTEND_URL,          // set this on Hostinger to your domain
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl / server-to-server
    if (allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Static uploads ────────────────────────────────────────────────────────────
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(path.resolve(uploadDir)));

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

app.get('/api/stats', async (req, res) => {
  try {
    const [totalProperties, availableProperties, totalLeads, newLeads, featuredProperties] = await Promise.all([
      db.properties.countAsync({ isPublished: true }),
      db.properties.countAsync({ isPublished: true, status: 'available' }),
      db.leads.countAsync({}),
      db.leads.countAsync({ status: 'new' }),
      db.properties.findAsync({ isFeatured: true, isPublished: true }).limit(4),
    ]);
    res.json({ totalProperties, availableProperties, totalLeads, newLeads, featuredProperties });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── SPA fallback — serve index.html for all non-API routes ───────────────────
// This makes React Router work on Hostinger (direct URL access / page refresh)
app.get('*', (req, res) => {
  const index = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(index)) {
    res.sendFile(index);
  } else {
    res.json({ status: 'ok', app: 'IYO Immo API', version: '1.0.0' });
  }
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ IYO Immo API → http://localhost:${PORT}`);
  console.log(`📂 Data    : ${path.resolve(process.env.DB_PATH || './data')}`);
  console.log(`🖼  Uploads : ${path.resolve(uploadDir)}`);
  console.log(`\n   First time? Run: node setup.js\n`);
});
