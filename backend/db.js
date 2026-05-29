require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
                 || process.env.SUPABASE_ANON_KEY
                 || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌  SUPABASE_URL and SUPABASE key must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Normalisation helpers ────────────────────────────────────────────────────
// Convert snake_case column names → camelCase (top-level only, so JSONB stays intact)
const s2c = k => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

/**
 * normalize(data) — call on every Supabase response before sending to frontend:
 *  • snake_case keys  →  camelCase
 *  • id               →  _id  (backward compat with existing frontend code)
 */
function normalize(data) {
  if (data === null || data === undefined) return null;
  if (Array.isArray(data)) return data.map(normalize);
  if (typeof data !== 'object') return data;

  const out = {};
  for (const [k, v] of Object.entries(data)) {
    out[s2c(k)] = v;      // keep JSONB values (title, specs…) as-is
  }
  if (out.id !== undefined) out._id = out.id;
  return out;
}

module.exports = { supabase, normalize };
