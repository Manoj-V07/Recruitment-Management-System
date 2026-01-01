const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const flexAuthMiddleware = async (req, res, next) => {
  try {
    let token;
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

router.get('/view/:applicationId', flexAuthMiddleware, async (req, res) => {
  try {
    const Application = require('../models/Application');
    const application = await Application.findById(req.params.applicationId);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (req.user.role !== 'hr' && application.candidateId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ 
      resumeUrl: application.resumeUrl,
      filename: application.resumeFilename || 'resume.pdf'
    });

  } catch (error) {
    console.error('Resume view error:', error);
    res.status(500).json({ message: 'Failed to view resume' });
  }
});

router.get('/download/:applicationId', flexAuthMiddleware, async (req, res) => {
  try {
    const Application = require('../models/Application');
    const application = await Application.findById(req.params.applicationId);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (req.user.role !== 'hr' && application.candidateId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ 
      resumeUrl: application.resumeUrl,
      filename: application.resumeFilename || 'resume.pdf'
    });

  } catch (error) {
    console.error('Resume download error:', error);
    res.status(500).json({ message: 'Failed to download resume' });
  }
});

module.exports = router;
