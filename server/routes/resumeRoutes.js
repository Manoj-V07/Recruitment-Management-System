const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Application = require('../models/Application');

/* ===============================
   FLEX AUTH (API-SAFE)
   =============================== */
const flexAuthMiddleware = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(' ')[1] || req.query.token;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

/* ===============================
   VIEW RESUME (REDIRECT ONLY)
   =============================== */
router.get('/view/:applicationId', flexAuthMiddleware, async (req, res) => {
  try {
    const app = await Application.findById(req.params.applicationId);
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (
      req.user.role !== 'hr' &&
      app.candidateId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const isPdf =
      app.resumeFilename?.toLowerCase().endsWith('.pdf') ||
      app.resumeUrl?.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      return res.status(400).json({ message: 'Only PDF preview supported' });
    }

    // 🔥 DO NOT STREAM — REDIRECT
    return res.redirect(app.resumeUrl);
  } catch (err) {
    console.error('Resume view error:', err);
    return res.status(500).json({ message: 'Failed to view resume' });
  }
});

/* ===============================
   DOWNLOAD RESUME (STREAM OK)
   =============================== */
router.get('/download/:applicationId', flexAuthMiddleware, async (req, res) => {
  try {
    const app = await Application.findById(req.params.applicationId);
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (
      req.user.role !== 'hr' &&
      app.candidateId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Force attachment download via Cloudinary
    const downloadUrl = app.resumeUrl.replace(
      '/raw/upload/',
      '/raw/upload/fl_attachment/'
    );

    return res.redirect(downloadUrl);
  } catch (err) {
    console.error('Resume download error:', err);
    return res.status(500).json({ message: 'Failed to download resume' });
  }
});

module.exports = router;
