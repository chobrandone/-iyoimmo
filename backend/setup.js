/**
 * Run manually: node setup.js
 * (server.js auto-seeds on first start, so this is only needed to RESET data)
 */
require('dotenv').config();
const seedDatabase = require('./seed');

seedDatabase()
  .then(() => {
    console.log(`
╔══════════════════════════════════════════════╗
║        ✅  IYO Immo Setup Complete!          ║
╠══════════════════════════════════════════════╣
║  Admin:  admin@iyoimmo.com / Admin@2026      ║
║  Agent:  jean@iyoimmo.com  / Agent@2026      ║
╚══════════════════════════════════════════════╝
`);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
  });
