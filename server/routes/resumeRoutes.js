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
    if (!app) return res.sendStatus(404);

    if (
      req.user.role !== 'hr' &&
      app.candidateId.toString() !== req.user._id.toString()
    ) {
      return res.sendStatus(403);
    }

    // ❗ resumeUrl MUST be filename only
    if (!app.resumeUrl || app.resumeUrl.includes('http')) {
      return res.status(500).json({ message: 'Invalid resume path stored' });
    }

    const filePath = path.join(resumesDir, app.resumeUrl);

    if (!fs.existsSync(filePath)) {
      return res.sendStatus(404);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'no-store');

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

/* ===============================
   DOWNLOAD PDF (NO FETCH, NO CORS)
================================ */
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

    if (!app.resumeUrl || app.resumeUrl.includes('http')) {
      return res.status(500).json({ message: 'Invalid resume path stored' });
    }

    const filePath = path.join(resumesDir, app.resumeUrl);

    if (!fs.existsSync(filePath)) {
      return res.sendStatus(404);
    }

    res.download(filePath, app.resumeFilename || 'resume.pdf');
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;
