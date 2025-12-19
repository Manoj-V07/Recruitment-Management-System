import { useEffect, useState } from 'react';
import { getMyApplications } from '../api/applicationApi';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await getMyApplications();
        setApplications(data);
      } catch (err) {
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'shortlisted':
        return '✓';
      case 'rejected':
        return '✕';
      default:
        return '📝';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Loading applications...</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="flex-grow p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">My Applications</h1>
            <p className="text-gray-600 mt-2">Track your job application status</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Filter Buttons */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All ({applications.length})
            </button>
            <button
              onClick={() => setFilter('applied')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'applied'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Applied ({applications.filter(a => a.status === 'applied').length})
            </button>
            <button
              onClick={() => setFilter('shortlisted')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'shortlisted'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Shortlisted ({applications.filter(a => a.status === 'shortlisted').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'rejected'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Rejected ({applications.filter(a => a.status === 'rejected').length})
            </button>
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-500 text-lg">
                {filter === 'all' ? 'No applications yet. Start applying for jobs!' : `No ${filter} applications.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map(application => (
                <div key={application._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {application.jobId?.jobTitle || 'N/A'}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-4">
                        <span className="text-lg">📍</span>
                        <span className="ml-2">{application.jobId?.location || 'N/A'}</span>
                        <span className="mx-4">•</span>
                        <span>{application.jobId?.jobType || 'N/A'}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Applied on: {new Date(application.appliedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div>
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)} {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-center text-gray-600 mt-8">
            Showing {filteredApplications.length} application(s)
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
