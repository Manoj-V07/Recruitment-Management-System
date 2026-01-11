const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'resumes',
    resource_type: 'raw',
    allowed_formats: ['pdf'], 
    public_id: (req, file) => {
      const base = file.originalname.replace(/\.[^/.]+$/, '');
      return `resume_${req.user._id}_${Date.now()}_${base}`;
    },
  },
});

module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
