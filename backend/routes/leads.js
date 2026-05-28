const router = require('express').Router();
const db = require('../db');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const b = req.body;
    const lead = await db.leads.insertAsync({
      type: b.type || 'contact', status: 'new',
      name: b.name || '', phone: b.phone || '', email: b.email || '',
      subject: b.subject || '', message: b.message || '',
      channel: b.channel || 'form',
      propertyId: b.property || null,
      submissionData: b.submissionData || null,
      notes: '',
    });
    res.status(201).json(lead);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const all = await db.leads.findAsync(filter);
    const leads = await db.leads.findAsync(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const withProp = await Promise.all(leads.map(async (l) => {
      const property = l.propertyId ? await db.properties.findOneAsync({ _id: l.propertyId }) : null;
      return { ...l, property: property ? { _id: property._id, title: property.title, neighbourhood: property.neighbourhood } : null };
    }));
    res.json({ leads: withProp, total: all.length, page, pages: Math.ceil(all.length / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id', protect, async (req, res) => {
  try {
    const { status, notes, assignedAgent } = req.body;
    const update = { $set: {} };
    if (status !== undefined) update.$set.status = status;
    if (notes !== undefined) update.$set.notes = notes;
    if (assignedAgent !== undefined) update.$set.assignedAgent = assignedAgent;
    await db.leads.updateAsync({ _id: req.params.id }, update);
    res.json(await db.leads.findOneAsync({ _id: req.params.id }));
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  await db.leads.removeAsync({ _id: req.params.id }, {});
  res.json({ message: 'Deleted' });
});

// Admin: approve property submission → creates live property
router.post('/:id/approve', protect, async (req, res) => {
  try {
    const lead = await db.leads.findOneAsync({ _id: req.params.id });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    if (lead.type !== 'property_submission')
      return res.status(400).json({ message: 'Only property submissions can be approved' });

    const sub = lead.submissionData || {};
    const year = new Date().getFullYear();
    const refId = `IYO-${year}-${Math.floor(Math.random() * 900) + 100}`;

    const titleFr = sub.description_fr
      ? `${sub.type || 'Bien'} — ${sub.neighbourhood || 'Bangui'}`
      : (sub.neighbourhood ? `Bien à ${sub.neighbourhood}` : 'Propriété');
    const titleEn = sub.description_en
      ? `${sub.type || 'Property'} — ${sub.neighbourhood || 'Bangui'}`
      : (sub.neighbourhood ? `Property in ${sub.neighbourhood}` : 'Property');

    const property = await db.properties.insertAsync({
      refId,
      title: { fr: titleFr, en: titleEn },
      description: {
        fr: sub.description_fr || `Bien soumis par ${lead.name}`,
        en: sub.description_en || `Property submitted by ${lead.name}`,
      },
      intent: sub.intent || 'rent',
      type: sub.type || 'apartment',
      status: 'available',
      price: parseFloat(sub.price) || 0,
      priceUnit: sub.priceUnit || 'month',
      neighbourhood: sub.neighbourhood || '',
      address: sub.address || '',
      city: 'Bangui',
      specs: {
        bedrooms: parseInt(sub.bedrooms) || 0,
        bathrooms: parseInt(sub.bathrooms) || 0,
        area: parseFloat(sub.area) || null,
        parking: parseInt(sub.parking) || 0,
        yearBuilt: null,
      },
      amenities: {},
      images: Array.isArray(sub.images) ? sub.images : [],
      coverImage: Array.isArray(sub.images) && sub.images.length > 0 ? sub.images[0] : '',
      nearby: '',
      isFeatured: false,
      isPublished: true,
      agentId: req.user._id,
      views: 0,
      ownerName: lead.name,
      ownerPhone: lead.phone,
      ownerEmail: lead.email,
    });

    await db.leads.updateAsync(
      { _id: req.params.id },
      { $set: { status: 'closed', approvedPropertyId: property._id, notes: (lead.notes || '') + `\nApproved by admin — property ${refId} created.` } }
    );

    res.json({ property, message: 'Property published successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stats/overview', protect, async (req, res) => {
  const [all, newL, inP, closed] = await Promise.all([
    db.leads.countAsync({}),
    db.leads.countAsync({ status: 'new' }),
    db.leads.countAsync({ status: 'in_progress' }),
    db.leads.countAsync({ status: 'closed' }),
  ]);
  res.json({ total: all, new: newL, inProgress: inP, closed });
});

module.exports = router;
