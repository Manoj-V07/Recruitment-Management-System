const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authMiddleware } = require('../middleware/authMiddleware');

// View resume inline (for display in browser)
router.get('/view/:applicationId', authMiddleware, async (req, res) => {
  try {
    const Application = require('../models/Application');
    const application = await Application.findById(req.params.applicationId);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Only HR or the candidate who applied can view
    if (req.user.role !== 'hr' && application.candidateId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const resumeUrl = application.resumeUrl;
    const filename = application.resumeFilename || 'resume.pdf';
    
    // Fetch file from Cloudinary
    const response = await axios.get(resumeUrl, {
      responseType: 'arraybuffer'
    });

    // Determine content type based on file extension
    const ext = filename.split('.').pop().toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === 'pdf') contentType = 'application/pdf';
    else if (ext === 'doc') contentType = 'application/msword';
    else if (ext === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    // Set proper headers for inline viewing
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(response.data);

  } catch (error) {
    console.error('Resume view error:', error);
    res.status(500).json({ message: 'Failed to view resume' });
  }
});

// Download resume with proper headers
router.get('/download/:applicationId', authMiddleware, async (req, res) => {
  try {
    const Application = require('../models/Application');
    const application = await Application.findById(req.params.applicationId);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Only HR or the candidate who applied can download
    if (req.user.role !== 'hr' && application.candidateId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const resumeUrl = application.resumeUrl;
    const filename = application.resumeFilename || 'resume.pdf';
    
    // Fetch file from Cloudinary
    const response = await axios.get(resumeUrl, {
      responseType: 'arraybuffer'
    });

    // Determine content type based on file extension
    const ext = filename.split('.').pop().toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === 'pdf') contentType = 'application/pdf';
    else if (ext === 'doc') contentType = 'application/msword';
    else if (ext === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    // Set proper headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(response.data);

  } catch (error) {
    console.error('Resume download error:', error);
    res.status(500).json({ message: 'Failed to download resume' });
  }
});

module.exports = router;
