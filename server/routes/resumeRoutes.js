const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const https = require('https');

const User = require('../models/User');
const Application = require('../models/Application');

/* =========================================================
   FLEX AUTH — API SAFE (NO REDIRECTS, NO HTML)
   ========================================================= */
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

/* =========================================================
   VIEW RESUME — PRODUCTION SAFE PDF STREAM (IFRAME)
   ========================================================= */
router.get('/view/:applicationId', flexAuthMiddleware, async (req, res) => {
  try {
    const app = await Application.findById(req.params.applicationId);
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Permission check
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

    /* 🔥 CRITICAL: Forward Range header for iframe PDF viewer */
    const options = { headers: {} };

    if (req.headers.range) {
      options.headers.Range = req.headers.range;
    }

    https.get(app.resumeUrl, options, (cloudinaryRes) => {
      // Forward correct status (200 or 206)
      res.status(cloudinaryRes.statusCode || 200);

      // Forward required headers for browser PDF rendering
      [
        'content-type',
        'content-length',
        'accept-ranges',
        'content-range'
      ].forEach((header) => {
        if (cloudinaryRes.headers[header]) {
          res.setHeader(header, cloudinaryRes.headers[header]);
        }
      });

      res.setHeader('Content-Disposition', 'inline');

      cloudinaryRes.pipe(res);

      cloudinaryRes.on('error', (err) => {
        console.error('Cloudinary stream error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'PDF stream failed' });
        }
      });
    }).on('error', (err) => {
      console.error('HTTPS fetch error:', err);
      res.status(500).json({ message: 'Failed to fetch resume' });
    });

  } catch (err) {
    console.error('Resume view error:', err);
    res.status(500).json({ message: 'Failed to view resume' });
  }
});

/* =========================================================
   DOWNLOAD RESUME — SIMPLE & SAFE
   ========================================================= */
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

    // Force Cloudinary download
    const downloadUrl = app.resumeUrl.replace(
      '/raw/upload/',
      '/raw/upload/fl_attachment/'
    );

    return res.redirect(downloadUrl);
  } catch (err) {
    console.error('Resume download error:', err);
    res.status(500).json({ message: 'Failed to download resume' });
  }
});

module.exports = router;
