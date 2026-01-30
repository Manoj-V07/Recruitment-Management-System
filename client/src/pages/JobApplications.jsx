import React, { useEffect, useState } from 'react';
import { updateApplicationStatus } from '../api/applicationApi';
import api from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const JobApplications = () => {
  const location = useLocation();
  const jobId = location.state?.jobId;

  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [closingJobId, setClosingJobId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');

      const endpoint = jobId
        ? `/applications/job/${jobId}`
        : '/applications/job/all';

      const res = await api.get(endpoint);
      setApplications(res.data);
    } catch (err) {
      console.error('Fetch applications error:', err);
      setError(err.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      setUpdatingId(applicationId);
      await updateApplicationStatus(applicationId, status);

      setApplications(prev =>
        prev.map(app =>
          app._id === applicationId ? { ...app, status } : app
        )
      );
    } catch (err) {
      console.error('Status update error:', err);
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCloseJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to close this job opening?')) {
      return;
    }

    try {
      setClosingJobId(jobId);
      await api.patch(`/jobs/close/${jobId}`);

      setApplications(prev =>
        prev.map(app =>
          app.jobId?._id === jobId
            ? { ...app, jobId: { ...app.jobId, isOpen: false } }
            : app
        )
      );
    } catch (err) {
      console.error('Close job error:', err);
      setError(err.response?.data?.message || 'Failed to close job');
    } finally {
      setClosingJobId(null);
    }
  };

  const handleViewResume = (applicationId) => {
  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_URL;

  if (!token) {
    alert('Session expired. Please login again.');
    return;
  }

  if (!API) {
    console.error('VITE_API_URL is not defined');
    return;
  }

  const resumeUrl = `${API}/resume/view/${applicationId}?token=${encodeURIComponent(token)}`;

  window.open(resumeUrl, '_blank', 'noopener,noreferrer');
};

  const handleDownloadResume = async (applicationId, filename) => {
    try {
      const API = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API}/resume/download/${applicationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'resume.pdf';
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download resume error:', err);
      setError('Failed to download resume');
    }
  };

  const filteredApplications =
    filter === 'all'
      ? applications
      : applications.filter(app => app.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-900/50 border-green-600 text-green-300';
      case 'rejected':
        return 'bg-red-900/50 border-red-600 text-red-300';
      default:
        return 'bg-blue-900/50 border-blue-600 text-blue-300';
    }
  };

  const statusCounts = {
    all: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <p className="animate-pulse text-neutral-400">
          Loading applications...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">
      <Header />

      <div className="p-5 max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold mb-4">
          Job Applications
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-900/40 border border-red-700 text-red-300 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-8">
          {Object.keys(statusCounts).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === f
                  ? 'bg-blue-600'
                  : 'bg-neutral-800 hover:bg-neutral-700'
              }`}
            >
              {f} ({statusCounts[f]})
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {filteredApplications.map(app => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-neutral-800 p-6 rounded-2xl bg-neutral-900"
            >
              <h3 className="text-xl font-bold">
                {app.jobId?.jobTitle || 'Unknown Job'}
              </h3>

              <p className="text-neutral-400">
                {app.candidateId?.username} — {app.candidateId?.email}
              </p>

              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full border text-sm ${getStatusColor(
                  app.status
                )}`}
              >
                {app.status}
              </span>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleViewResume(app._id)}
                  className="px-4 py-2 bg-green-600 rounded-lg"
                >
                  View Resume
                </button>

                <button
                  onClick={() =>
                    handleDownloadResume(app._id, app.resumeFilename)
                  }
                  className="px-4 py-2 bg-purple-600 rounded-lg"
                >
                  Download
                </button>
              </div>

              <div className="flex gap-2 mt-4">
                {['applied', 'shortlisted', 'rejected'].map(status => (
                  <button
                    key={status}
                    disabled={updatingId === app._id}
                    onClick={() =>
                      handleStatusUpdate(app._id, status)
                    }
                    className="px-3 py-2 bg-neutral-800 rounded-lg"
                  >
                    {status}
                  </button>
                ))}
              </div>

              {app.jobId?.isOpen && (
                <button
                  onClick={() => handleCloseJob(app.jobId._id)}
                  disabled={closingJobId === app.jobId._id}
                  className="mt-4 px-4 py-2 bg-red-700 rounded-lg"
                >
                  Close Job
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JobApplications;
