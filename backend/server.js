require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('./db');
const app = express();

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'], credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/team', require('./routes/team'));
app.use('/api/upload', require('./routes/upload'));

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

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ IYO Immo API → http://localhost:${PORT}`);
  console.log(`📂 Data folder: ${path.resolve(process.env.DB_PATH || './data')}`);
  console.log(`\n   First time? Run: node setup.js\n`);
});
