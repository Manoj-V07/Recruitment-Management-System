import { useEffect, useState } from 'react';
import { createJob, getMyJobs } from '../api/jobApi';

export default function HR() {
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('Desc');
  const [skills, setSkills] = useState('JS');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await getMyJobs();
        setJobs(data);
      } catch (err) {
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const submit = async () => {
    if (!title.trim()) {
      alert('Please enter a job title');
      return;
    }

    try {
      setLoading(true);
      await createJob({
        jobTitle: title,
        jobDescription: description,
        requiredSkills: skills.split(',').map(s => s.trim()),
        experience: 0,
        location: 'Remote',
        jobType: 'Full-Time',
      });
      alert('Job Created Successfully!');
      setTitle('');
      setDescription('Desc');
      setSkills('JS');
      setShowForm(false);
      const data = await getMyJobs();
      setJobs(data);
    } catch (err) {
      setError('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">HR Dashboard</h1>
          <p className="text-gray-600 mt-2">Create and manage job postings</p>
        </div>

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
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
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
                  <p className="text-sm text-gray-500">Skills: {job.requiredSkills?.join(', ') || 'N/A'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
