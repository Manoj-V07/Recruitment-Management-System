const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Application = require('../models/Application');
const { resumesDir } = require('../config/localStorage');

// Auth middleware - supports both header and query token
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

// VIEW PDF (new tab)
router.get('/view/:applicationId', flexAuth, async (req, res) => {
  try {
    const app = await Application.findById(req.params.applicationId);
    if (!app) return res.sendStatus(404);

    if (
      req.user.role !== 'hr' &&
      app.candidateId.toString() !== req.user._id.toString()
    ) {
      return res.sendStatus(403);
    }

    const filePath = path.join(resumesDir, app.resumeUrl);

    if (!path.resolve(filePath).startsWith(path.resolve(resumesDir))) {
      return res.sendStatus(403);
    }

    if (!fs.existsSync(filePath)) {
      return res.sendStatus(404);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => res.sendStatus(500));
    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// DOWNLOAD PDF
router.get('/download/:applicationId', flexAuth, async (req, res) => {
  try {
    const app = await Application.findById(req.params.applicationId);
    if (!app) return res.sendStatus(404);

    if (
      req.user.role !== 'hr' &&
      app.candidateId.toString() !== req.user._id.toString()
    ) {
      return res.sendStatus(403);
    }

    const filePath = path.join(resumesDir, app.resumeUrl);

    if (!path.resolve(filePath).startsWith(path.resolve(resumesDir))) {
      return res.sendStatus(403);
    }

    if (!fs.existsSync(filePath)) {
      return res.sendStatus(404);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${app.resumeFilename || 'resume.pdf'}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => res.sendStatus(500));
    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;
