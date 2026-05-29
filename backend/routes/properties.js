const router = require('express').Router();
const { supabase, normalize } = require('../db');
const { protect, adminOnly } = require('../middleware/auth');

const genRef = () => `IYO-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`;

const SORT = {
  '-createdAt': { col: 'created_at', asc: false },
  'price':      { col: 'price',      asc: true  },
  '-price':     { col: 'price',      asc: false },
};

/** Apply simple equality / range filters to a Supabase query */
function applyFilters(q, params, requirePublished = true) {
  if (requirePublished)       q = q.eq('is_published', true);
  if (params.intent)          q = q.eq('intent', params.intent);
  if (params.type)            q = q.eq('type', params.type);
  if (params.status)          q = q.eq('status', params.status);
  if (params.neighbourhood)   q = q.ilike('neighbourhood', `%${params.neighbourhood}%`);
  if (params.featured==='true') q = q.eq('is_featured', true);
  if (params.minPrice)        q = q.gte('price', parseFloat(params.minPrice));
  if (params.maxPrice)        q = q.lte('price', parseFloat(params.maxPrice));
  return q;
}

/** Filter JSONB fields (bedrooms inside specs, amenities) in JS */
function jsFilter(list, params) {
  if (params.bedrooms) list = list.filter(p => (p.specs?.bedrooms||0) >= parseInt(params.bedrooms));
  if (params.amenities) {
    const keys = params.amenities.split(',');
    list = list.filter(p => keys.every(k => p.amenities?.[k] === true));
  }
  return list;
}

const attachAgent = p => ({
  ...p,
  agent: p.adminUsers
    ? { _id: p.adminUsers.id, id: p.adminUsers.id, name: p.adminUsers.name, phone: p.adminUsers.phone, email: p.adminUsers.email, avatar: p.adminUsers.avatar }
    : null,
  adminUsers: undefined,
});

// ── Public: list ──────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    let q = supabase.from('properties')
      .select('*, adminUsers:admin_users!agent_id(id,name,phone,email,avatar)');
    q = applyFilters(q, req.query, true);
    const s = SORT[req.query.sort] || { col: 'created_at', asc: false };
    q = q.order(s.col, { ascending: s.asc });

    const { data, error } = await q;
    if (error) throw error;

    let list = jsFilter(normalize(data), req.query).map(attachAgent);

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 12;
    const total = list.length;
    const paged = list.slice((page-1)*limit, page*limit);

    res.json({ properties: paged, total, page, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Admin: all ────────────────────────────────────────────────────────────────
router.get('/admin/all', protect, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;

    let q = supabase.from('properties')
      .select('*, adminUsers:admin_users!agent_id(id,name)', { count: 'exact' });
    if (req.query.status) q = q.eq('status', req.query.status);
    if (req.query.intent) q = q.eq('intent', req.query.intent);
    q = q.order('created_at', { ascending: false }).range((page-1)*limit, page*limit-1);

    const { data, error, count } = await q;
    if (error) throw error;

    const properties = normalize(data).map(p => ({
      ...p,
      agent: p.adminUsers ? { _id: p.adminUsers.id, name: p.adminUsers.name } : null,
      adminUsers: undefined,
    }));
    res.json({ properties, total: count, page, pages: Math.ceil(count/limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Public: similar ───────────────────────────────────────────────────────────
router.get('/:id/similar', async (req, res) => {
  try {
    const { data: p } = await supabase.from('properties')
      .select('intent,neighbourhood').eq('id', req.params.id).single();
    if (!p) return res.json([]);
    const { data } = await supabase.from('properties').select('*')
      .neq('id', req.params.id).eq('intent', p.intent)
      .eq('neighbourhood', p.neighbourhood)
      .eq('is_published', true).eq('status', 'available').limit(3);
    res.json(normalize(data||[]));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Public: single ────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('properties')
      .select('*, adminUsers:admin_users!agent_id(id,name,phone,email,avatar)')
      .eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ message: 'Property not found' });
    await supabase.from('properties').update({ views: (data.views||0)+1 }).eq('id', req.params.id);
    res.json(attachAgent(normalize(data)));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Admin: create ─────────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const b = req.body;
    const { data, error } = await supabase.from('properties').insert({
      ref_id:        genRef(),
      title:         b.title        || { fr:'', en:'' },
      description:   b.description  || { fr:'', en:'' },
      intent:        b.intent       || 'rent',
      type:          b.type         || 'apartment',
      status:        b.status       || 'available',
      price:         parseFloat(b.price) || 0,
      price_unit:    b.priceUnit    || 'month',
      neighbourhood: b.neighbourhood || '',
      address:       b.address      || '',
      city:          b.city         || 'Bangui',
      specs:         b.specs        || { bedrooms:0, bathrooms:0, area:null, parking:0, yearBuilt:null },
      amenities:     b.amenities    || {},
      images:        b.images       || [],
      cover_image:   b.coverImage   || '',
      nearby:        b.nearby       || '',
      is_featured:   !!b.isFeatured,
      is_published:  b.isPublished !== false,
      agent_id:      b.agent || req.user._id,
      views:         0,
    }).select().single();
    if (error) throw error;
    res.status(201).json(normalize(data));
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ── Admin: update ─────────────────────────────────────────────────────────────
router.patch('/:id', protect, async (req, res) => {
  try {
    const b = req.body;
    const map = {
      title:'title', description:'description', intent:'intent', type:'type',
      status:'status', price:'price', priceUnit:'price_unit',
      neighbourhood:'neighbourhood', address:'address', specs:'specs',
      amenities:'amenities', images:'images', coverImage:'cover_image',
      nearby:'nearby', isFeatured:'is_featured', isPublished:'is_published',
    };
    const update = { updated_at: new Date().toISOString() };
    for (const [c, s] of Object.entries(map)) if (b[c] !== undefined) update[s] = b[c];
    if (b.agent !== undefined) update.agent_id = b.agent;

    const { data, error } = await supabase.from('properties')
      .update(update).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(normalize(data));
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ── Admin: delete ─────────────────────────────────────────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  await supabase.from('properties').delete().eq('id', req.params.id);
  res.json({ message: 'Property deleted' });
});

module.exports = router;
