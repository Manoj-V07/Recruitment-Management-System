const Job = require('../models/Job');


const createJob = async (req, res) => {
  try {
    const { jobTitle, jobDescription, requiredSkills, experience, location, jobType } = req.body;

    if (!jobTitle || !jobDescription || !Array.isArray(requiredSkills) || requiredSkills.length === 0 || experience === undefined || experience === null || !location || !jobType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const job = await Job.create({ jobTitle, jobDescription, requiredSkills, experience, location, jobType, createdBy: req.user._id});
    return res.status(201).json({ message: 'Job created successfully', jobId: job._id });

  } catch (error) {
    console.error('Error creating job:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({ message : `Job created by ${req.user.username}` , jobs});

  } catch (error) {
    console.error('Error fetching HR jobs:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('createdBy', 'username email').sort({ createdAt: -1 });

    return res.status(200).json({ message : 'All job listings' , jobs});

  } catch (error) {
    console.error('Error fetching all jobs:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const getOpenJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isOpen: true }).populate('createdBy', 'username').sort({ createdAt: -1 });

    return res.status(200).json(jobs);

  } catch (error) {
    console.error('Error fetching open jobs:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const closeJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (req.user.role === 'hr' && job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    job.isOpen = false;
    await job.save();

    return res.status(200).json({ message: 'Job closed successfully' });

  } catch (error) {
    console.error('Error closing job:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createJob, getMyJobs, getAllJobs, getOpenJobs, closeJob };
