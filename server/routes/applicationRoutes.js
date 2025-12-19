const express = require('express');
const router = express.Router();

const { applyForJob, getApplicationsForJob, getMyApplications, updateApplicationStatus } = require('../contollers/applicationController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/apply/:jobId',authMiddleware,applyForJob);
router.get('/my',authMiddleware,getMyApplications);
router.get('/job/:jobId', authMiddleware,getApplicationsForJob);
router.patch('/status/:applicationId',authMiddleware,updateApplicationStatus);

module.exports = router;
