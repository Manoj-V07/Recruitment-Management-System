import { useEffect, useState } from 'react';
import { getOpenJobs } from '../api/jobApi';
import { applyForJob, getMyApplications } from '../api/applicationApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JobDetailsModal from '../components/JobDetailsModal';
import { motion } from 'framer-motion';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [myApplications, setMyApplications] = useState([]);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Filter states
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isCandidate = user.role === 'candidate';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const jobsData = await getOpenJobs();
        setJobs(jobsData);
        
        if (isCandidate) {
          const applicationsData = await getMyApplications();
          setMyApplications(applicationsData);
        }
      } catch (err) {
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isCandidate]);

  const handleApply = async (jobId, resumeFile) => {
    if (!isCandidate) {
      alert('Only candidates can apply for jobs. Please login as a candidate.');
      return;
    }

    try {
      setApplyingJobId(jobId);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      await applyForJob(jobId, formData);
      alert('Application submitted successfully!');
      
      // Refresh applications
      const applicationsData = await getMyApplications();
      setMyApplications(applicationsData);
      
      // Close modal
      setSelectedJob(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply for job');
    } finally {
      setApplyingJobId(null);
    }
  };

  const hasApplied = (jobId) => {
    return myApplications.some(app => app.jobId?._id === jobId);
  };

  const getApplicationStatus = (jobId) => {
    const application = myApplications.find(app => app.jobId?._id === jobId);
    return application?.status;
  };

  // Get unique values for filters
  const uniqueJobTypes = ['all', ...new Set(jobs.map(job => job.jobType).filter(Boolean))];
  const uniqueLocations = ['all', ...new Set(jobs.map(job => job.location).filter(Boolean))];
  const uniqueExperiences = ['all', '0-2', '2-5', '5+'];

  const filteredJobs = jobs.filter(job => {
    // Search filter
    const matchesSearch = job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.requiredSkills && job.requiredSkills.some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    // Job type filter
    const matchesJobType = selectedJobType === 'all' || job.jobType === selectedJobType;
    
    // Location filter
    const matchesLocation = selectedLocation === 'all' || job.location === selectedLocation;
    
    // Experience filter
    let matchesExperience = true;
    if (selectedExperience !== 'all') {
      const jobExp = job.experience || 0;
      if (selectedExperience === '0-2') {
        matchesExperience = jobExp <= 2;
      } else if (selectedExperience === '2-5') {
        matchesExperience = jobExp > 2 && jobExp <= 5;
      } else if (selectedExperience === '5+') {
        matchesExperience = jobExp > 5;
      }
    }
    
    return matchesSearch && matchesJobType && matchesLocation && matchesExperience;
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-neutral-900"><p className="text-neutral-400">Loading jobs...</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-900">
      <Header />
      <div className="flex-grow p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white">Open Positions</h1>
            <p className="text-neutral-400 mt-2">Find your next opportunity</p>
          </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-600 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by job title, location, or skills..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-6 py-3 bg-neutral-800 border-2 border-neutral-700 text-white rounded-lg focus:outline-none focus:border-blue-500 text-lg"
          />
        </div>

        {/* Filter Section */}
        <div className="mb-8 bg-neutral-800 border border-neutral-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Job Type Filter */}
            <div>
              <label className="block text-neutral-300 font-semibold mb-2">Job Type</label>
              <select
                value={selectedJobType}
                onChange={e => setSelectedJobType(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-900 border-2 border-neutral-700 text-white rounded-lg focus:outline-none focus:border-blue-500 capitalize"
              >
                {uniqueJobTypes.map(type => (
                  <option key={type} value={type} className="capitalize">
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-neutral-300 font-semibold mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-900 border-2 border-neutral-700 text-white rounded-lg focus:outline-none focus:border-blue-500"
              >
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Filter */}
            <div>
              <label className="block text-neutral-300 font-semibold mb-2">Experience</label>
              <select
                value={selectedExperience}
                onChange={e => setSelectedExperience(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-900 border-2 border-neutral-700 text-white rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Experience Levels</option>
                <option value="0-2">0-2 years</option>
                <option value="2-5">2-5 years</option>
                <option value="5+">5+ years</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(selectedJobType !== 'all' || selectedLocation !== 'all' || selectedExperience !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedJobType('all');
                setSelectedLocation('all');
                setSelectedExperience('all');
                setSearchTerm('');
              }}
              className="mt-4 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-12 text-center">
            <p className="text-neutral-400 text-lg">No jobs found. Try different search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, index) => (
              <motion.div 
                key={job._id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 cursor-pointer"
                onClick={() => setSelectedJob(job)}
              >
                <div className="mb-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-white mb-2">{job.jobTitle}</h3>
                    {!job.isOpen && (
                      <span className="bg-red-900/50 border border-red-700 text-red-300 text-xs font-bold px-3 py-1 rounded-full">
                        CLOSED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-neutral-400 mb-2">
                    <span className="ml-0">{job.location}</span>
                  </div>
                </div>

                <p className="text-neutral-400 text-sm mb-4 line-clamp-3">{job.jobDescription}</p>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-900/50 text-blue-300 border border-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {job.jobType}
                    </span>
                    {job.vacancies && (
                      <span className="bg-purple-900/50 text-purple-300 border border-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                        {job.vacancies} {job.vacancies === 1 ? 'Vacancy' : 'Vacancies'}
                      </span>
                    )}
                    {job.requiredSkills && job.requiredSkills.slice(0, 2).map((skill, idx) => (
                      <span key={idx} className="bg-neutral-700 text-neutral-300 border border-neutral-600 text-xs font-semibold px-3 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills && job.requiredSkills.length > 2 && (
                      <span className="bg-neutral-700 text-neutral-300 border border-neutral-600 text-xs font-semibold px-3 py-1 rounded-full">
                        +{job.requiredSkills.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!job.isOpen) {
                      alert('This job opening is closed and no longer accepting applications.');
                      return;
                    }
                    setSelectedJob(job);
                  }}
                  disabled={!isCandidate || hasApplied(job._id) || applyingJobId === job._id || !job.isOpen}
                  className={`w-full font-semibold py-2 rounded-lg transition-colors ${
                    !job.isOpen
                      ? 'bg-red-900/50 border border-red-600 text-red-300 cursor-not-allowed'
                      : hasApplied(job._id)
                      ? getApplicationStatus(job._id) === 'shortlisted'
                        ? 'bg-green-900/50 border border-green-600 text-green-300 cursor-not-allowed'
                        : getApplicationStatus(job._id) === 'rejected'
                        ? 'bg-red-900/50 border border-red-600 text-red-300 cursor-not-allowed'
                        : 'bg-blue-900/50 border border-blue-600 text-blue-300 cursor-not-allowed'
                      : isCandidate
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  {!job.isOpen
                    ? 'CLOSED'
                    : applyingJobId === job._id
                    ? 'Applying...'
                    : hasApplied(job._id)
                    ? getApplicationStatus(job._id) === 'shortlisted'
                      ? 'Shortlisted'
                      : getApplicationStatus(job._id) === 'rejected'
                      ? 'Rejected'
                      : 'Applied'
                    : isCandidate
                    ? 'Apply Now'
                    : 'Login to Apply'
                  }
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <p className="text-center text-neutral-400 mt-8">Showing {filteredJobs.length} job(s)</p>
      </div>
      </div>
      <Footer />
      
      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={handleApply}
          isApplying={applyingJobId === selectedJob._id}
          hasApplied={hasApplied(selectedJob._id)}
        />
      )}
    </div>
  );
}
