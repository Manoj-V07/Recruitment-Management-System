import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationsForJob } from '../api/applicationApi';
import { updateApplicationStatus } from '../api/applicationApi';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function JobApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await getApplicationsForJob(jobId);
        setApplications(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [jobId]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setUpdatingId(applicationId);
      await updateApplicationStatus(applicationId, newStatus);
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status: newStatus } : app
      ));
      alert('Application status updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Loading applications...</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="flex-grow p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate('/hr')}
                className="text-indigo-600 hover:text-indigo-700 font-semibold mb-2 flex items-center"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-4xl font-bold text-gray-800">Job Applications</h1>
              <p className="text-gray-600 mt-2">Review and manage candidate applications</p>
            </div>
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
                {filter === 'all' ? 'No applications received yet.' : `No ${filter} applications.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map(application => (
                <div key={application._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">
                        {application.candidateId?.username || 'N/A'}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        📧 {application.candidateId?.email || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Applied on: {new Date(application.appliedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div>
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => handleStatusUpdate(application._id, 'shortlisted')}
                      disabled={application.status === 'shortlisted' || updatingId === application._id}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-2 rounded-lg transition-colors"
                    >
                      {updatingId === application._id ? 'Updating...' : '✓ Shortlist'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(application._id, 'applied')}
                      disabled={application.status === 'applied' || updatingId === application._id}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 rounded-lg transition-colors"
                    >
                      {updatingId === application._id ? 'Updating...' : '📝 Mark Applied'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(application._id, 'rejected')}
                      disabled={application.status === 'rejected' || updatingId === application._id}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-2 rounded-lg transition-colors"
                    >
                      {updatingId === application._id ? 'Updating...' : '✕ Reject'}
                    </button>
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
