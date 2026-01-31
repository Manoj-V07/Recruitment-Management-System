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

  /* ===============================
     FETCH APPLICATIONS
  =============================== */
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
      setError(err.response?.data?.message || 'Failed to fetch applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  /* ===============================
     STATUS UPDATE
  =============================== */
  const handleStatusUpdate = async (applicationId, status) => {
    try {
      setUpdatingId(applicationId);
      await updateApplicationStatus(applicationId, status);

      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status } : app
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  /* ===============================
     CLOSE JOB
  =============================== */
  const handleCloseJob = async (jobId) => {
    if (!confirm('Are you sure you want to close this job opening?')) return;

    try {
      setClosingJobId(jobId);
      await api.patch(`/jobs/close/${jobId}`);

      setApplications((prev) =>
        prev.map((app) =>
          app.jobId?._id === jobId
            ? { ...app, jobId: { ...app.jobId, isOpen: false } }
            : app
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close job');
    } finally {
      setClosingJobId(null);
    }
  };

  /* ===============================
     RESUME VIEW & DOWNLOAD
     (NO FETCH, NO CORS)
  =============================== */
  const API = import.meta.env.VITE_API_URL;

  const handleViewResume = (applicationId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please login again.');
      return;
    }

    window.open(
      `${API}/resume/view/${applicationId}?token=${token}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleDownloadResume = (applicationId) => {
    window.location.href = `${API}/resume/download/${applicationId}`;
  };

  /* ===============================
     FILTERING
  =============================== */
  const filteredApplications = applications.filter((app) =>
    filter === 'all' ? true : app.status === filter
  );

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
    applied: applications.filter((a) => a.status === 'applied').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  /* ===============================
     LOADING STATE
  =============================== */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <p className="animate-pulse text-neutral-400">
          Loading applications...
        </p>
      </div>
    );
  }

  /* ===============================
     UI
  =============================== */
  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">
      <Header />

      <div className="p-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-4xl font-extrabold mb-4">
            Job Applications
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-900/40 border border-red-700 rounded-xl text-red-300">
              {error}
            </div>
          )}

          {/* FILTERS */}
          <div className="flex gap-3 mb-8">
            {Object.keys(statusCounts).map((f) => (
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

          {/* APPLICATION LIST */}
          <div className="space-y-6">
            {filteredApplications.map((app) => (
              <div
                key={app._id}
                className="border border-neutral-800 p-6 rounded-2xl bg-neutral-900"
              >
                <h3 className="text-xl font-bold mb-1">
                  {app.jobId?.jobTitle}
                </h3>

                <p className="text-neutral-400 mb-2">
                  {app.candidateId?.username} — {app.candidateId?.email}
                </p>

                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm border ${getStatusColor(
                    app.status
                  )}`}
                >
                  {app.status}
                </span>

                {/* RESUME ACTIONS */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleViewResume(app._id)}
                    className="px-4 py-2 bg-green-600 rounded-lg"
                  >
                    View Resume
                  </button>

                </div>

                {/* STATUS UPDATE */}
                <div className="flex gap-2 mt-4">
                  {['applied', 'shortlisted', 'rejected'].map((status) => (
                    <button
                      key={status}
                      disabled={
                        updatingId === app._id || app.status === status
                      }
                      onClick={() =>
                        handleStatusUpdate(app._id, status)
                      }
                      className="px-3 py-1 bg-neutral-800 rounded"
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
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default JobApplications;