import React, { useEffect, useState } from 'react';
import { updateApplicationStatus } from '../api/applicationApi';
import api from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ResumeViewerModal from '../components/ResumeViewerModal';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const JobApplications = () => {
  const location = useLocation();
  const jobId = location.state?.jobId; // Get jobId from navigation state
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [closingJobId, setClosingJobId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingResume, setViewingResume] = useState(null); // State for resume modal

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      // If jobId is provided, fetch applications for that specific job
      // Otherwise, fetch all applications for HR
      const endpoint = jobId ? `/applications/job/${jobId}` : '/applications/job/all';
      const res = await api.get(endpoint);
      setApplications(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch applications");
      console.error('Fetch applications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  // Update status handler
  const handleStatusUpdate = async (applicationId, status) => {
    try {
      setUpdatingId(applicationId);
      await updateApplicationStatus(applicationId, status);
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app._id === applicationId ? { ...app, status } : app
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
      console.error('Status update error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Close job (Manual by HR)
  const handleCloseJob = async (jobId) => {
    if (!confirm('Are you sure you want to close this job opening?')) {
      return;
    }

    try {
      setClosingJobId(jobId);
      await api.patch(`/jobs/close/${jobId}`);
      
      // Update local state to reflect closed job
      setApplications(prev =>
        prev.map(app =>
          app.jobId?._id === jobId
            ? { ...app, jobId: { ...app.jobId, isOpen: false } }
            : app
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to close job");
      console.error('Close job error:', err);
    } finally {
      setClosingJobId(null);
    }
  };

  // Filtering logic
  const filteredApplications = applications.filter(app => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  // Download resume
  const downloadResume = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.setAttribute("download", filename || "resume.pdf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-900/50 border-green-600 text-green-300';
      case 'rejected':
        return 'bg-red-900/50 border-red-600 text-red-300';
      case 'applied':
      default:
        return 'bg-blue-900/50 border-blue-600 text-blue-300';
    }
  };

  // Count applications by status
  const statusCounts = {
    all: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-900">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-neutral-400 text-lg">Loading applications...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-900">
      <Header />
      <div className="flex-grow p-6 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-3xl font-bold mb-2 text-white">Job Applications</h2>
          <p className="text-neutral-400 mb-6">
            {jobId ? 'Manage applications for this specific job' : 'Manage applications for your job postings'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-600 text-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            {["all", "applied", "shortlisted", "rejected"].map((f) => (
              <button
                key={f}
                className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                    : "bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700"
                }`}
                onClick={() => setFilter(f)}
              >
                {f} ({statusCounts[f]})
              </button>
            ))}
          </div>

          {/* Application list */}
          <div className="space-y-4">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12 bg-neutral-800/50 rounded-lg border border-neutral-700">
                <p className="text-neutral-400 text-lg">No applications found.</p>
                {filter !== "all" && (
                  <p className="text-neutral-500 mt-2">Try changing the filter</p>
                )}
              </div>
            ) : (
              filteredApplications.map((app) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-neutral-700 p-5 rounded-lg bg-neutral-800 hover:bg-neutral-800/80 transition-colors"
                >
                  {/* Job Title */}
                  <div className="mb-4 pb-4 border-b border-neutral-700">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {app.jobId?.jobTitle || 'Unknown Job'}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-neutral-400">
                      <span>📍 {app.jobId?.location || 'N/A'}</span>
                      <span>💼 {app.jobId?.jobType || 'N/A'}</span>
                      {app.jobId?.isOpen !== undefined && (
                        <span className={app.jobId.isOpen ? 'text-green-400' : 'text-red-400'}>
                          {app.jobId.isOpen ? '✓ Open' : '✗ Closed'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Candidate Info */}
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-white">
                      {app.candidateId?.username || 'Unknown Candidate'}
                    </h4>
                    <p className="text-neutral-400">
                      📧 {app.candidateId?.email || 'N/A'}
                    </p>
                    <div className="mt-2">
                      <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusColor(app.status)}`}>
                        Status: {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Resume Actions */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors font-medium"
                      onClick={() => setViewingResume({ applicationId: app._id, filename: app.resumeFilename })}
                    >
                      👁️ View Resume
                    </button>

                    <a
                      className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors font-medium inline-block"
                      href={`http://localhost:5000/resume/download/${app._id}?token=${localStorage.getItem('token')}`}
                      download={app.resumeFilename || 'resume.pdf'}
                    >
                      ⬇️ Download Resume
                    </a>
                  </div>

                  {/* Status Update Buttons */}
                  <div className="mb-4">
                    <p className="text-sm text-neutral-400 mb-2">Update Status:</p>
                    <div className="flex flex-wrap gap-2">
                      {["applied", "shortlisted", "rejected"].map((status) => (
                        <button
                          key={status}
                          disabled={updatingId === app._id || app.status === status}
                          onClick={() => handleStatusUpdate(app._id, status)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                            app.status === status
                              ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                              : 'bg-neutral-700 hover:bg-neutral-600 text-white'
                          } ${updatingId === app._id ? 'opacity-50 cursor-wait' : ''}`}
                        >
                          {updatingId === app._id ? '⏳' : ''} {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Close Job Button */}
                  {app.jobId?.isOpen && (
                    <button
                      onClick={() => handleCloseJob(app.jobId._id)}
                      disabled={closingJobId === app.jobId._id}
                      className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-wait"
                    >
                      {closingJobId === app.jobId._id ? "⏳ Closing..." : "🔒 Close Job Opening"}
                    </button>
                  )}
                  {!app.jobId?.isOpen && (
                    <p className="text-red-400 font-semibold">🔒 This job posting is closed</p>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
      
      {/* Resume Viewer Modal */}
      {viewingResume && (
        <ResumeViewerModal
          applicationId={viewingResume.applicationId}
          filename={viewingResume.filename}
          onClose={() => setViewingResume(null)}
        />
      )}
    </div>
  );
};

export default JobApplications;
