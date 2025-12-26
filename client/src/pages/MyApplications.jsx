import { useEffect, useState } from 'react';
import { getMyApplications } from '../api/applicationApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

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
        return 'bg-green-900/50 border border-green-600 text-green-300';
      case 'rejected':
        return 'bg-red-900/50 border border-red-600 text-red-300';
      default:
        return 'bg-blue-900/50 border border-blue-600 text-blue-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'shortlisted':
        return 'Shortlisted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Applied';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-neutral-900"><p className="text-neutral-400">Loading applications...</p></div>;
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
            <h1 className="text-4xl font-bold text-white">My Applications</h1>
            <p className="text-neutral-400 mt-2">Track your job application status</p>
          </motion.div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-600 text-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Filter Buttons */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              All ({applications.length})
            </button>
            <button
              onClick={() => setFilter('applied')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'applied'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Applied ({applications.filter(a => a.status === 'applied').length})
            </button>
            <button
              onClick={() => setFilter('shortlisted')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'shortlisted'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Shortlisted ({applications.filter(a => a.status === 'shortlisted').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'rejected'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Rejected ({applications.filter(a => a.status === 'rejected').length})
            </button>
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-12 text-center">
              <p className="text-neutral-400 text-lg">
                {filter === 'all' ? 'No applications yet. Start applying for jobs!' : `No ${filter} applications.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application, index) => (
                <motion.div 
                  key={application._id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {application.jobId?.jobTitle || 'N/A'}
                      </h3>
                      <div className="flex items-center text-neutral-400 mb-4">
                        <span className="ml-0">{application.jobId?.location || 'N/A'}</span>
                        <span className="mx-4">•</span>
                        <span>{application.jobId?.jobType || 'N/A'}</span>
                      </div>
                      <p className="text-sm text-neutral-500">
                        Applied on: {new Date(application.appliedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div>
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <p className="text-center text-neutral-400 mt-8">
            Showing {filteredApplications.length} application(s)
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
