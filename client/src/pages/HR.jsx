import { useEffect, useState } from 'react';
import { createJob, getMyJobs } from '../api/jobApi';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HR() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('Desc');
  const [skills, setSkills] = useState('JS');
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

    try {
      setLoading(true);
      await createJob({ jobTitle: title, jobDescription: description, requiredSkills: skills.split(',').map(s => s.trim()).filter(s => s), experience: 0, location: 'Remote', jobType: 'Full-Time'});
      alert('Job Created Successfully!');
      setTitle('');
      setDescription('');
      setSkills('');
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="flex-grow p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">HR Dashboard</h1>
            <p className="text-gray-600 mt-2">Create and manage job postings</p>
          </div>

        {/* Approval Status Banner */}
        {!isApproved && (
          <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg flex items-start">
            <div className="flex-shrink-0 mr-4">
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-800 mb-2">⏳ Account Pending Approval</h3>
              <p className="text-yellow-700">
                Your HR account is awaiting admin approval. You will be able to create and manage job postings once approved.
                Please contact your administrator for more information.
              </p>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-400 rounded-lg flex items-center">
            <svg className="h-6 w-6 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-700 font-semibold">✓ Your account is approved. You can now create job postings.</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Create Job Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Create New Job</h2>
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
                  ? 'bg-indigo-600 hover:bg-indigo-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              } text-white font-semibold py-2 px-6 rounded-lg transition-colors`}
            >
              {showForm ? '✕ Close' : '+ New Job'}
            </button>
          </div>

          {showForm && (
            <div className="space-y-4 border-t pt-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Senior React Developer"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Job description"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 h-24"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Required Skills (comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  placeholder="e.g., React, JavaScript, CSS"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={submit}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors mt-6"
              >
                {loading ? 'Creating...' : 'Create Job'}
              </button>
            </div>
          )}
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Jobs</h2>

          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No jobs created yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map(job => (
                <div key={job._id} className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{job.jobTitle}</h3>
                  <p className="text-gray-600 text-sm mb-4">{job.jobDescription}</p>
                  <div className="mb-4">
                    <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full mr-2">
                      {job.jobType}
                    </span>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                      📍 {job.location}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Skills: {job.requiredSkills?.join(', ') || 'N/A'}</p>
                  <button
                    onClick={() => navigate(`/job-applications/${job._id}`)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    View Applications
                  </button>
                </div>
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
