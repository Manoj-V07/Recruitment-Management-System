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
   VIEW RESUME (STREAM PDF, NO REDIRECT)
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

    // DEPLOYMENT FIX: Stream PDF directly instead of 302 redirect
    // This prevents Vercel's SPA rewrite rule from intercepting the response
    const https = require('https');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Accept-Ranges', 'bytes');

    https.get(app.resumeUrl, (cloudinaryStream) => {
      // If Cloudinary returns error, respond with JSON error
      if (cloudinaryStream.statusCode !== 200) {
        return res.status(500).json({ message: 'Failed to fetch resume from storage' });
      }
      
      // Pipe Cloudinary response directly to client
      cloudinaryStream.pipe(res);
      
      cloudinaryStream.on('error', (err) => {
        console.error('Cloudinary stream error:', err);
        res.status(500).json({ message: 'Failed to stream resume' });
      });
    }).on('error', (err) => {
      console.error('Resume fetch error:', err);
      res.status(500).json({ message: 'Failed to fetch resume' });
    });
  } catch (err) {
    console.error('Resume view error:', err);
    return res.status(500).json({ message: 'Failed to view resume' });
  }
});

/* ===============================
   DOWNLOAD RESUME (STREAM PDF WITH ATTACHMENT HEADER)
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

    // DEPLOYMENT FIX: Stream PDF instead of redirecting
    const https = require('https');
    const filename = app.resumeFilename || 'resume.pdf';
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    https.get(app.resumeUrl, (cloudinaryStream) => {
      if (cloudinaryStream.statusCode !== 200) {
        return res.status(500).json({ message: 'Failed to fetch resume from storage' });
      }
      
      cloudinaryStream.pipe(res);
      
      cloudinaryStream.on('error', (err) => {
        console.error('Cloudinary stream error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Failed to stream resume' });
        }
      });
    }).on('error', (err) => {
      console.error('Resume fetch error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to fetch resume' });
      }
    });
  } catch (err) {
    console.error('Resume download error:', err);
    return res.status(500).json({ message: 'Failed to download resume' });
  }
});

module.exports = router;
