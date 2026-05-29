const router = require('express').Router();
const multer = require('multer');
const path   = require('path');
const { supabase } = require('../db');

// In-memory storage — files go straight to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (/\.(jpeg|jpg|png|webp)$/i.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('Only JPEG, PNG or WebP images are allowed'));
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
      contentType:   file.mimetype,
      cacheControl:  '3600',
      upsert:        false,
    });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

// POST /api/upload/images  — multiple (open to all users + public submissions)
router.post('/images', upload.array('images', 20), async (req, res) => {
  try {
    const urls = await Promise.all(req.files.map(uploadToStorage));
    res.json({ urls });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/upload/image  — single
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    const url = await uploadToStorage(req.file);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
