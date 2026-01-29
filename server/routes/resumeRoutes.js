const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Application = require('../models/Application');
const { resumesDir } = require('../config/localStorage');

/* ===============================
   FLEX AUTH (API SAFE)
================================ */
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
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

/* ===============================
   VIEW RESUME (STREAM PDF)
   ✅ SAFE FOR IFRAME
================================ */
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

    // Stream PDF from local storage
    const filePath = path.join(resumesDir, app.resumeUrl);
    
    // Security check: ensure file is within resumesDir
    if (!path.resolve(filePath).startsWith(path.resolve(resumesDir))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    const stream = fs.createReadStream(filePath);
    stream.on('error', (err) => {
      console.error('Stream error:', err);
      res.status(500).json({ message: 'Failed to stream resume' });
    });
    
    stream.pipe(res);
  } catch (err) {
    console.error('Resume view error:', err);
    return res.status(500).json({ message: 'Failed to load resume' });
  }
});

/* ===============================
   DOWNLOAD RESUME (STREAM WITH ATTACHMENT)
================================ */
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

    // Get file from local storage
    const filePath = path.join(resumesDir, app.resumeUrl);
    
    // Security check: ensure file is within resumesDir
    if (!path.resolve(filePath).startsWith(path.resolve(resumesDir))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file not found' });
    }

    const filename = app.resumeFilename || 'resume.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    const stream = fs.createReadStream(filePath);
    stream.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to download resume' });
      }
    });
    
    stream.pipe(res);
  } catch (err) {
    console.error('Resume download error:', err);
    return res.status(500).json({ message: 'Failed to download resume' });
  }
});

module.exports = router;
