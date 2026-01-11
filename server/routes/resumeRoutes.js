const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Application = require('../models/Application');
const https = require('https');
const http = require('http');

const flexAuthMiddleware = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(' ')[1] || req.query.token;

    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

/* VIEW (proxy PDF stream for iframe) */
router.get('/view/:applicationId', flexAuthMiddleware, async (req, res) => {
  try {
    const app = await Application.findById(req.params.applicationId);
    if (!app) return res.status(404).json({ message: 'Not found' });

    if (
      req.user.role !== 'hr' &&
      app.candidateId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const isPdf = app.resumeFilename?.toLowerCase().endsWith('.pdf') || app.resumeUrl?.toLowerCase().endsWith('.pdf');
    
    if (!isPdf) {
      return res.status(400).json({ message: 'Only PDF files can be previewed' });
    }

    // Proxy the PDF from Cloudinary for inline viewing
    const protocol = app.resumeUrl.startsWith('https') ? https : http;
    
    protocol.get(app.resumeUrl, (fileStream) => {
      // Set headers for inline PDF viewing
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      
      if (fileStream.headers['content-length']) {
        res.setHeader('Content-Length', fileStream.headers['content-length']);
      }

      // Pipe the file stream to response
      fileStream.pipe(res);
    }).on('error', (err) => {
      console.error('View error:', err);
      res.status(500).json({ message: 'Failed to load resume' });
    });
  } catch (error) {
    console.error('View error:', error);
    res.status(500).json({ message: 'Failed to load resume' });
  }
});

/* DOWNLOAD (streaming with auth) */
router.get('/download/:applicationId', flexAuthMiddleware, async (req, res) => {
  try {
    const app = await Application.findById(req.params.applicationId);
    if (!app) return res.status(404).json({ message: 'Not found' });

    // Check permissions
    if (
      req.user.role !== 'hr' &&
      app.candidateId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Get the Cloudinary URL with attachment flag
    const downloadUrl = app.resumeUrl.replace('/raw/upload/', '/raw/upload/fl_attachment/');
    
    // Determine protocol
    const protocol = downloadUrl.startsWith('https') ? https : http;
    
    // Stream the file from Cloudinary
    protocol.get(downloadUrl, (fileStream) => {
      // Set headers for download
      res.setHeader('Content-Type', fileStream.headers['content-type'] || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${app.resumeFilename || 'resume.pdf'}"`);
      
      if (fileStream.headers['content-length']) {
        res.setHeader('Content-Length', fileStream.headers['content-length']);
      }

      // Pipe the file stream to response
      fileStream.pipe(res);
    }).on('error', (err) => {
      console.error('Download error:', err);
      res.status(500).json({ message: 'Failed to download resume' });
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to download resume' });
  }
});

module.exports = router;
