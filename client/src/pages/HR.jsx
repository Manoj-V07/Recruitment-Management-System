import { useEffect, useState } from 'react';
import { createJob, getMyJobs } from '../api/jobApi';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function HR() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('Full-Time');
  const [vacancies, setVacancies] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsApproved(user.isApproved || false);

    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await getMyJobs();
        setJobs(data.jobs || []);
      } catch (err) {
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const submit = async () => {
    if (!isApproved) {
      alert('Your account is pending approval. Please wait for admin approval to create jobs.');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a job title');
      return;
    }
    
    if (!description.trim()) {
      alert('Please enter a job description');
      return;
    }
    
    if (!skills.trim()) {
      alert('Please enter required skills');
      return;
    }
    
    if (!location.trim()) {
      alert('Please enter a location');
      return;
    }
    
    if (vacancies < 1) {
      alert('Vacancies must be at least 1');
      return;
    }

    try {
      setLoading(true);
      await createJob({ 
        jobTitle: title, 
        jobDescription: description, 
        requiredSkills: skills,
        experience: experience, 
        location: location, 
        jobType: jobType,
        vacancies: vacancies
      });
      alert('Job Created Successfully!');
      setTitle('');
      setDescription('');
      setSkills('');
      setExperience(0);
      setLocation('');
      setJobType('Full-Time');
      setVacancies(1);
      setShowForm(false);
      const data = await getMyJobs();
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-4xl font-bold text-white">HR Dashboard</h1>
            <p className="text-neutral-400 mt-2">Create and manage job postings</p>
          </motion.div>

        {/* Approval Status Banner */}
        {!isApproved && (
          <div className="mb-6 p-6 bg-yellow-900/50 border-2 border-yellow-600 rounded-lg flex items-start">
            <div className="flex-shrink-0 mr-4">
              <svg className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-300 mb-2">Account Pending Approval</h3>
              <p className="text-yellow-200">
                Your HR account is awaiting admin approval. You will be able to create and manage job postings once approved.
                Please contact your administrator for more information.
              </p>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="mb-6 p-4 bg-green-900/50 border-2 border-green-600 rounded-lg flex items-center">
            <svg className="h-6 w-6 text-green-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-200 font-semibold">Your account is approved. You can now create job postings.</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-600 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Create Job Form */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Create New Job</h2>
            <button
              onClick={() => {
                if (!isApproved) {
                  alert('Your account is pending approval. Please wait for admin approval to create jobs.');
                  return;
                }
                setShowForm(!showForm);
              }}
              className={`${
                isApproved 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-neutral-700 cursor-not-allowed'
              } text-white font-semibold py-2 px-6 rounded-lg transition-colors`}
            >
              {showForm ? 'Close' : '+ New Job'}
            </button>
          </div>

          {showForm && (
            <div className="space-y-4 border-t border-neutral-700 pt-6">
              <div>
                <label className="block text-neutral-300 font-semibold mb-2">Job Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Senior React Developer"
                  className="w-full px-4 py-2 bg-neutral-900 border-2 border-neutral-700 text-white rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-2">Description *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detailed job description and responsibilities"
                  className="w-full px-4 py-2 bg-neutral-900 border-2 border-neutral-700 text-white rounded-lg focus:outline-none focus:border-blue-500 h-24"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-2">Required Skills (comma separated) *</label>
                <input
                  type="text"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  placeholder="e.g., React, JavaScript, CSS"
                  className="w-full px-4 py-2 bg-neutral-900 border-2 border-neutral-700 text-white rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-2">Experience (years) *</label>
                  <input
                    type="number"
                    min="0"
                    value={experience}
                    onChange={e => setExperience(Number(e.target.value))}
                    
                    className="w-full px-4 py-2 bg-neutral-900 border-2 border-neutral-700 text-white rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-2">Vacancies *</label>
                  <input
                    type="number"
                    min="1"
                    value={vacancies}
                    onChange={e => setVacancies(Number(e.target.value))}
                   
                    className="w-full px-4 py-2 bg-neutral-900 border-2 border-neutral-700 text-white rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-2">Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g., Chennai, Remote"
                    className="w-full px-4 py-2 bg-neutral-900 border-2 border-neutral-700 text-white rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-2">Job Type *</label>
                  <select
                    value={jobType}
                    onChange={e => setJobType(e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-900 border-2 border-neutral-700 text-white rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <button
                onClick={submit}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-semibold py-3 rounded-lg transition-colors mt-6"
              >
                {loading ? 'Creating...' : 'Create Job'}
              </button>
            </div>
          )}
        </div>

        {/* Jobs List */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">My Jobs</h2>

          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-400 text-lg">No jobs created yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job, index) => (
                <motion.div 
                  key={job._id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="border-2 border-neutral-700 rounded-lg p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{job.jobTitle}</h3>
                  <p className="text-neutral-400 text-sm mb-4">{job.jobDescription}</p>
                  <div className="mb-4">
                    <span className="inline-block bg-blue-900/50 border border-blue-700 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mr-2">
                      {job.jobType}
                    </span>
                    <span className="inline-block bg-neutral-700 border border-neutral-600 text-neutral-300 text-xs font-semibold px-3 py-1 rounded-full mr-2">
                      {job.location}
                    </span>
                    <span className="inline-block bg-purple-900/50 border border-purple-700 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full mr-2">
                      {job.vacancies} {job.vacancies === 1 ? 'Vacancy' : 'Vacancies'}
                    </span>
                    {!job.isOpen && (
                      <span className="inline-block bg-red-900/50 border border-red-700 text-red-300 text-xs font-semibold px-3 py-1 rounded-full">
                        CLOSED
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 mb-4">Skills: {job.requiredSkills?.join(', ') || 'N/A'}</p>
                  <p className="text-sm text-neutral-500 mb-4">Experience: {job.experience} {job.experience === 1 ? 'year' : 'years'}</p>
                  <button
                    onClick={() => navigate('/job-applications', { state: { jobId: job._id } })}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    View Applications
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
    </div>
  );
}
