const router = require('express').Router();
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const { protect } = require('../middleware/auth');

const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (/\.(jpeg|jpg|png|webp)$/i.test(path.extname(file.originalname))) cb(null, true);
  else cb(new Error('Only image files allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});

router.post('/images', protect, upload.array('images', 20), (req, res) => {
  const urls = req.files.map(f => `/uploads/${f.filename}`);
  res.json({ urls });
});

router.post('/image', protect, upload.single('image'), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

router.delete('/images/:filename', protect, (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); res.json({ message: 'Deleted' }); }
  else res.status(404).json({ message: 'File not found' });
});

module.exports = router;
