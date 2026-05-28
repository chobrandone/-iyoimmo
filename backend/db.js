require('dotenv').config();
const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');

const dataDir = process.env.DB_PATH || './data';
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const mkStore = (name) => new Datastore({
  filename: path.join(dataDir, `${name}.db`),
  autoload: true,
  timestampData: true,
});

const db = {
  users: mkStore('users'),
  properties: mkStore('properties'),
  leads: mkStore('leads'),
  team: mkStore('team'),
};

// Indexes
db.users.ensureIndex({ fieldName: 'email', unique: true });
db.properties.ensureIndex({ fieldName: 'refId', unique: true });
db.properties.ensureIndex({ fieldName: 'intent' });
db.properties.ensureIndex({ fieldName: 'isPublished' });
db.leads.ensureIndex({ fieldName: 'status' });

module.exports = db;
