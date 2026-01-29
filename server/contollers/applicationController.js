const Application = require('../models/Application');
const Job = require('../models/Job');

const applyForJob = async (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can apply' });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job || !job.isOpen) {
      return res.status(404).json({ message: 'Job not found or closed' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'PDF resume required' });
    }

    const application = await Application.create({
      jobId: job._id,
      candidateId: req.user._id,
      resumeUrl: req.file.filename,          // Store only filename for local storage
      resumeFilename: req.file.originalname,
    });

    res.status(201).json({
      message: 'Applied successfully',
      applicationId: application._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { applyForJob };



const getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const applications = await Application.find({ candidateId: req.user._id }).populate('jobId', 'jobTitle location jobType').sort({ createdAt: -1 });
    return res.status(200).json(applications);

  } catch (error) {
    console.error('Get my applications error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'HR access only' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const applications = await Application.find({ jobId })
      .populate('candidateId', 'username email')
      .populate('jobId', 'jobTitle location jobType vacancies isOpen')
      .sort({ createdAt: -1 });

    return res.status(200).json(applications);

  } catch (error) {
    console.error('Get applications for job error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getAllApplicationsForHR = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'HR access only' });
    }

    // Get all jobs created by this HR
    const jobs = await Job.find({ createdBy: req.user._id });
    const jobIds = jobs.map(job => job._id);

    // Get all applications for those jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('candidateId', 'username email')
      .populate('jobId', 'jobTitle location jobType vacancies isOpen')
      .sort({ createdAt: -1 });

    return res.status(200).json(applications);

  } catch (error) {
    console.error('Get all applications error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'HR access only' });
    }

    if (!['applied', 'shortlisted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const job = await Job.findById(application.jobId);

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    application.status = status;
    await application.save();

    // Auto-close job when shortlisted count reaches vacancies
    if (status === 'shortlisted') {
      const shortlistedCount = await Application.countDocuments({
        jobId: job._id,
        status: 'shortlisted'
      });

      if (shortlistedCount >= job.vacancies) {
        job.isOpen = false;
        await job.save();
      }
    }

    return res.status(200).json({
      message: 'Application status updated successfully',
    });

  } catch (error) {
    console.error('Update application status error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { applyForJob, getMyApplications, getApplicationsForJob, getAllApplicationsForHR, updateApplicationStatus };
