const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'resumes',
    resource_type: 'raw', 
    allowed_formats: ['pdf', 'doc', 'docx'],
    public_id: (req, file) => {
      const originalName = file.originalname.replace(/\.[^/.]+$/, '');
      return `resume_${req.user._id}_${Date.now()}_${originalName}`;
    },
    use_filename: true,
    unique_filename: false,
  },
});

const uploadResume = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
});

module.exports = uploadResume;
