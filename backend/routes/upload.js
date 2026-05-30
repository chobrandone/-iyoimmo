const router = require('express').Router();
const multer = require('multer');
const path   = require('path');
const { supabase } = require('../db');

// In-memory storage — files go straight to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (/\.(jpeg|jpg|png|webp)$/i.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('Seuls les formats JPEG, PNG ou WebP sont acceptés'));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

async function uploadToStorage(file) {
  const ext      = path.extname(file.originalname).toLowerCase();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file.buffer, {
      contentType:  file.mimetype,
      cacheControl: '3600',
      upsert:       false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

// Multer error handler
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ message: 'Fichier trop volumineux (max 10 MB)' });
    return res.status(400).json({ message: err.message });
  }
  if (err) return res.status(400).json({ message: err.message });
  next();
}

// POST /api/upload/images  — multiple
router.post('/images', (req, res, next) => {
  upload.array('images', 20)(req, res, (err) => {
    if (err instanceof multer.MulterError || err)
      return handleMulterError(err, req, res, next);
    next();
  });
}, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: 'Aucune image reçue' });
    const urls = await Promise.all(req.files.map(uploadToStorage));
    res.json({ urls });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/upload/image  — single
router.post('/image', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError || err)
      return handleMulterError(err, req, res, next);
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: 'Aucune image reçue' });
    const url = await uploadToStorage(req.file);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
