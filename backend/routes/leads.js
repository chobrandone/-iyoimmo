const router = require('express').Router();
const { supabase, normalize } = require('../db');
const { protect } = require('../middleware/auth');

// ── Public: submit a lead / form ──────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const b = req.body;
    // Optionally attach public user id if auth header present
    let publicUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const { id, type } = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        if (type === 'public') publicUserId = id;
      } catch {}
    }

    const { data, error } = await supabase.from('leads').insert({
      type:            b.type      || 'contact',
      status:          'new',
      name:            b.name      || '',
      phone:           b.phone     || '',
      email:           b.email     || '',
      subject:         b.subject   || '',
      message:         b.message   || '',
      channel:         b.channel   || 'form',
      property_id:     b.property  || null,
      submission_data: b.submissionData || null,
      public_user_id:  publicUserId,
      notes:           '',
    }).select().single();
    if (error) throw error;
    res.status(201).json(normalize(data));
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ── Admin: list leads ─────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;

    let q = supabase.from('leads')
      .select('*, property:properties!property_id(id,title,neighbourhood)', { count: 'exact' });
    if (req.query.status) q = q.eq('status', req.query.status);
    if (req.query.type)   q = q.eq('type',   req.query.type);
    q = q.order('created_at', { ascending: false }).range((page-1)*limit, page*limit-1);

    const { data, error, count } = await q;
    if (error) throw error;
    res.json({ leads: normalize(data||[]), total: count, page, pages: Math.ceil(count/limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Admin: update lead ────────────────────────────────────────────────────────
router.patch('/:id', protect, async (req, res) => {
  try {
    const { status, notes, assignedAgent } = req.body;
    const update = { updated_at: new Date().toISOString() };
    if (status        !== undefined) update.status         = status;
    if (notes         !== undefined) update.notes          = notes;
    if (assignedAgent !== undefined) update.assigned_agent = assignedAgent;
    const { data, error } = await supabase.from('leads')
      .update(update).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(normalize(data));
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ── Admin: delete lead ────────────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  await supabase.from('leads').delete().eq('id', req.params.id);
  res.json({ message: 'Deleted' });
});

// ── Admin: approve property submission → publish as live property ─────────────
router.post('/:id/approve', protect, async (req, res) => {
  try {
    const { data: leadData, error } = await supabase.from('leads')
      .select('*').eq('id', req.params.id).single();
    if (error || !leadData) return res.status(404).json({ message: 'Lead not found' });

    const lead = normalize(leadData);
    if (lead.type !== 'property_submission')
      return res.status(400).json({ message: 'Only property submissions can be approved' });

    const sub    = lead.submissionData || {};
    const refId  = `IYO-${new Date().getFullYear()}-${Math.floor(Math.random()*900)+100}`;

    const { data: propData, error: propErr } = await supabase.from('properties').insert({
      ref_id:        refId,
      title:         { fr:`${sub.type||'Bien'} — ${sub.neighbourhood||'Bangui'}`, en:`${sub.type||'Property'} — ${sub.neighbourhood||'Bangui'}` },
      description:   { fr: sub.description_fr||`Bien soumis par ${lead.name}`, en: sub.description_en||`Property submitted by ${lead.name}` },
      intent:        sub.intent      || 'rent',
      type:          sub.type        || 'apartment',
      status:        'available',
      price:         parseFloat(sub.price) || 0,
      price_unit:    sub.priceUnit   || 'month',
      neighbourhood: sub.neighbourhood || '',
      address:       sub.address     || '',
      city:          'Bangui',
      specs:         { bedrooms: parseInt(sub.bedrooms)||0, bathrooms: parseInt(sub.bathrooms)||0, area: parseFloat(sub.area)||null, parking: parseInt(sub.parking)||0 },
      amenities:     {},
      images:        Array.isArray(sub.images) ? sub.images : [],
      cover_image:   Array.isArray(sub.images)&&sub.images.length ? sub.images[0] : '',
      is_featured:   false,
      is_published:  true,
      agent_id:      req.user._id,
      views:         0,
      owner_name:    lead.name,
      owner_phone:   lead.phone,
      owner_email:   lead.email,
    }).select().single();
    if (propErr) throw propErr;

    await supabase.from('leads').update({
      status: 'closed',
      approved_property_id: propData.id,
      notes: (lead.notes||'') + `\nApproved — property ${refId} created.`,
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id);

    res.json({ property: normalize(propData), message: 'Property published successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Admin: stats ──────────────────────────────────────────────────────────────
router.get('/stats/overview', protect, async (req, res) => {
  const [all, newL, inP, closed] = await Promise.all([
    supabase.from('leads').select('id', { count:'exact', head:true }),
    supabase.from('leads').select('id', { count:'exact', head:true }).eq('status','new'),
    supabase.from('leads').select('id', { count:'exact', head:true }).eq('status','in_progress'),
    supabase.from('leads').select('id', { count:'exact', head:true }).eq('status','closed'),
  ]);
  res.json({ total: all.count, new: newL.count, inProgress: inP.count, closed: closed.count });
});

module.exports = router;
