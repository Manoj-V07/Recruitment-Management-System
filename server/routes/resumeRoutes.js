const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Application = require('../models/Application');
const { resumesDir } = require('../config/localStorage');

const authViaQuery = async (req, res, next) => {
  try {
    const token = req.query.token;
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

// OPEN PDF (new tab)
router.get('/open/:applicationId', authViaQuery, async (req, res) => {
  const app = await Application.findById(req.params.applicationId);
  if (!app) return res.sendStatus(404);

  if (
    req.user.role !== 'hr' &&
    app.candidateId.toString() !== req.user._id.toString()
  ) {
    return res.sendStatus(403);
  }

  const filePath = path.join(resumesDir, app.resumePath);

  if (!fs.existsSync(filePath)) {
    return res.sendStatus(404);
  }

  return res.sendFile(filePath);
});

// DOWNLOAD PDF
router.get('/download/:applicationId', authViaQuery, async (req, res) => {
  const app = await Application.findById(req.params.applicationId);
  if (!app) return res.sendStatus(404);

  const filePath = path.join(resumesDir, app.resumePath);
  if (!fs.existsSync(filePath)) return res.sendStatus(404);

  return res.download(filePath, app.resumeFilename || 'resume.pdf');
});

module.exports = router;
