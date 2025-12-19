import { useEffect, useState } from 'react';
import { getOpenJobs } from '../api/jobApi';
import { applyForJob, getMyApplications } from '../api/applicationApi';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [myApplications, setMyApplications] = useState([]);
  const [applyingJobId, setApplyingJobId] = useState(null);

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

  const handleApply = async (jobId) => {
    if (!isCandidate) {
      alert('Only candidates can apply for jobs. Please login as a candidate.');
      return;
    }

    try {
      setApplyingJobId(jobId);
      await applyForJob(jobId);
      alert('Application submitted successfully!');
      
      // Refresh applications
      const applicationsData = await getMyApplications();
      setMyApplications(applicationsData);
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

  const filteredJobs = jobs.filter(job =>
    job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Loading jobs...</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="flex-grow p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Open Positions</h1>
            <p className="text-gray-600 mt-2">Find your next opportunity</p>
          </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by job title or location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-lg"
          />
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No jobs found. Try different search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(job => (
              <div key={job._id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 cursor-pointer transform hover:scale-105">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{job.jobTitle}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <span className="text-lg">📍</span>
                    <span className="ml-2">{job.location}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{job.jobDescription}</p>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {job.jobType}
                    </span>
                    {job.requiredSkills && job.requiredSkills.slice(0, 2).map((skill, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills && job.requiredSkills.length > 2 && (
                      <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                        +{job.requiredSkills.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => handleApply(job._id)}
                  disabled={!isCandidate || hasApplied(job._id) || applyingJobId === job._id}
                  className={`w-full font-semibold py-2 rounded-lg transition-colors ${
                    hasApplied(job._id)
                      ? getApplicationStatus(job._id) === 'shortlisted'
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : getApplicationStatus(job._id) === 'rejected'
                        ? 'bg-red-600 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white cursor-not-allowed'
                      : isCandidate
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-gray-400 text-white cursor-not-allowed'
                  }`}
                >
                  {applyingJobId === job._id
                    ? 'Applying...'
                    : hasApplied(job._id)
                    ? getApplicationStatus(job._id) === 'shortlisted'
                      ? '✓ Shortlisted'
                      : getApplicationStatus(job._id) === 'rejected'
                      ? '✕ Rejected'
                      : '✓ Applied'
                    : isCandidate
                    ? 'Apply Now'
                    : 'Login to Apply'
                  }
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-gray-600 mt-8">Showing {filteredJobs.length} job(s)</p>
      </div>
      </div>
      <Footer />
    </div>
  );
}
