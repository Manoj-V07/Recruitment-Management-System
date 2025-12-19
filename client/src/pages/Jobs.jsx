import { useEffect, useState } from 'react';
import { getOpenJobs } from '../api/jobApi';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await getOpenJobs();
        setJobs(data);
      } catch (err) {
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Loading jobs...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Open Positions</h1>
            <p className="text-gray-600 mt-2">Find your next opportunity</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Logout
          </button>
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

                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-gray-600 mt-8">Showing {filteredJobs.length} job(s)</p>
      </div>
    </div>
  );
}
