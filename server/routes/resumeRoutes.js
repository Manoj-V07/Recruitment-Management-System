const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Application = require('../models/Application');
const { resumesDir } = require('../config/localStorage');

/* ===============================
   AUTH
================================ */
const flexAuth = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(' ')[1] || req.query.token;

    if (!token) return res.sendStatus(401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.sendStatus(401);

    req.user = user;
    next();
  } catch {
    return res.sendStatus(401);
  }
};

/* ===============================
   VIEW PDF (new tab)
================================ */
router.get('/view/:applicationId', flexAuth, async (req, res) => {
  try {
    const app = await Application.findById(req.params.applicationId);
    if (!app) {
      console.error('Application not found:', req.params.applicationId);
      return res.status(404).json({ message: 'Application not found' });
    }

    if (
      req.user.role !== 'hr' &&
      app.candidateId.toString() !== req.user._id.toString()
    ) {
      return res.sendStatus(403);
    }

    // Check if resumeUrl exists and is valid
    if (!app.resumeUrl) {
      console.error('No resume URL for application:', app._id);
      return res.status(404).json({ message: 'No resume file associated with this application' });
    }

    // If it's a Cloudinary URL, reject (old data)
    if (app.resumeUrl.includes('http') || app.resumeUrl.includes('cloudinary')) {
      console.error('Invalid resume format (Cloudinary URL):', app.resumeUrl);
      return res.status(500).json({ message: 'Resume data needs migration. Please reupload resume.' });
    }

    const filePath = path.join(resumesDir, app.resumeUrl);

    if (!fs.existsSync(filePath)) {
      console.error('Resume file not found at:', filePath, 'stored as:', app.resumeUrl);
      return res.status(404).json({ message: 'Resume file not found. Please reupload.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'no-store');

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('View resume error:', err);
    res.status(500).json({ message: 'Failed to load resume' });
  }
});

/* ===============================
   DOWNLOAD PDF (NO FETCH, NO CORS)
================================ */
router.get('/download/:applicationId', flexAuth, async (req, res) => {
  try {
    const app = await Application.findById(req.params.applicationId);
    if (!app) {
      console.error('Application not found:', req.params.applicationId);
      return res.status(404).json({ message: 'Application not found' });
    }

    if (
      req.user.role !== 'hr' &&
      app.candidateId.toString() !== req.user._id.toString()
    ) {
      return res.sendStatus(403);
    }

    // Check if resumeUrl exists and is valid
    if (!app.resumeUrl) {
      console.error('No resume URL for application:', app._id);
      return res.status(404).json({ message: 'No resume file associated with this application' });
    }

    // If it's a Cloudinary URL, reject (old data)
    if (app.resumeUrl.includes('http') || app.resumeUrl.includes('cloudinary')) {
      console.error('Invalid resume format (Cloudinary URL):', app.resumeUrl);
      return res.status(500).json({ message: 'Resume data needs migration. Please reupload resume.' });
    }

    const filePath = path.join(resumesDir, app.resumeUrl);

    if (!fs.existsSync(filePath)) {
      console.error('Resume file not found at:', filePath, 'stored as:', app.resumeUrl);
      return res.status(404).json({ message: 'Resume file not found. Please reupload.' });
    }

    res.download(filePath, app.resumeFilename || 'resume.pdf');
  } catch (err) {
    console.error('Download resume error:', err);
    res.status(500).json({ message: 'Failed to download resume' });
  }
});

module.exports = router;
