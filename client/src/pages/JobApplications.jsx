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
  const jobId = location.state?.jobId;
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [closingJobId, setClosingJobId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingResume, setViewingResume] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
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
      setError(err.response?.data?.message || "Failed to update status");
      console.error('Status update error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCloseJob = async (jobId) => {
    if (!confirm('Are you sure you want to close this job opening?')) return;
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
      setError(err.response?.data?.message || "Failed to close job");
      console.error('Close job error:', err);
    } finally {
      setClosingJobId(null);
    }
  };


  const handleDownloadResume = async (applicationId, filename) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://recruitment-management-system-3-nvub.onrender.com';
      const token = localStorage.getItem('token');
      
      // Fetch as blob from backend streaming endpoint
      const response = await fetch(`${API_URL}/resume/download/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Download failed');

      // Get the blob
      const blob = await response.blob();
      
      // Extract filename from Content-Disposition header or use provided filename
      const contentDisposition = response.headers.get('Content-Disposition');
      let downloadFilename = filename || 'resume.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          downloadFilename = filenameMatch[1].replace(/['"]/g, '');
          downloadFilename = decodeURIComponent(downloadFilename);
        }
      }
      
      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      setError('Failed to download resume');
      console.error('Download resume error:', err);
    }
  };


  const filteredApplications = applications.filter(app => filter === "all" ? true : app.status === filter);

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

  const statusCounts = {
    all: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <p className="animate-pulse text-neutral-400">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/20 blur-[160px]" />
      <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-purple-500/20 blur-[160px]" />

      <Header />

      <div className="flex-grow p-8 max-w-7xl mx-auto relative z-10">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          <h2 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
            Job Applications
          </h2>

          <p className="text-neutral-400/80 text-lg mb-10">
            {jobId ? 'Manage applications for this job' : 'Review all applied candidates'}
          </p>

          {error && (
            <div className="mb-6 p-5 rounded-2xl bg-red-900/40 border border-red-700 text-red-300 font-medium backdrop-blur">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-10">
            {Object.keys(statusCounts).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-xl font-semibold capitalize transition-all ${
                  filter === f
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-700/40"
                    : "bg-neutral-900/60 border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                {f} ({statusCounts[f]})
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {filteredApplications.length === 0 ? (
              <div className="text-center p-16 bg-neutral-900/60 backdrop-blur rounded-3xl border border-neutral-800 text-neutral-400">
                No applications match this filter.
              </div>
            ) : (
              filteredApplications.map((app) => (
                <motion.div key={app._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group border border-neutral-800 p-7 rounded-3xl bg-neutral-900/70 backdrop-blur hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-600/10 transition-all"
                >

                  <h3 className="text-2xl font-bold mb-2">
                    {app.jobId?.jobTitle || "Unknown Job"}
                  </h3>
                  <div className="text-neutral-400 flex gap-4 text-sm mb-6">
                    <span>📍 {app.jobId?.location || "N/A"}</span>
                    <span>💼 {app.jobId?.jobType || "N/A"}</span>
                    {app.jobId?.isOpen !== undefined && (
                      <span className={app.jobId?.isOpen ? "text-green-400" : "text-red-400"}>
                        {app.jobId?.isOpen ? "Open" : "Closed"}
                      </span>
                    )}
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold">
                      {app.candidateId?.username || "Unknown Candidate"}
                    </h4>
                    <p className="text-neutral-400">📧 {app.candidateId?.email}</p>
                    <span className={`inline-block px-4 py-1.5 mt-3 rounded-full border font-semibold text-sm ${getStatusColor(app.status)}`}>
                      Status: {app.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <button
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 font-medium hover:opacity-90"
                      onClick={() => setViewingResume({ applicationId: app._id, filename: app.resumeFilename })}
                    >
                       View Resume
                    </button>

                    <button
                      onClick={() => handleDownloadResume(app._id, app.resumeFilename)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 font-medium hover:opacity-90"
                    >
                       Download
                    </button>
                  </div>

                  <div className="mb-6">
                    <p className="text-neutral-400 text-sm mb-2">Update Status:</p>
                    <div className="flex flex-wrap gap-3">
                      {["applied", "shortlisted", "rejected"].map((status) => (
                        <button
                          key={status}
                          disabled={updatingId === app._id || app.status === status}
                          onClick={() => handleStatusUpdate(app._id, status)}
                          className={`px-4 py-2 rounded-lg font-medium capitalize ${
                            app.status === status
                              ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                              : "bg-neutral-800 hover:bg-neutral-700"
                          } ${updatingId === app._id ? "opacity-50 cursor-wait" : ""}`}
                        >
                          {updatingId === app._id ? "⏳" : status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {app.jobId?.isOpen && (
                    <button
                      onClick={() => handleCloseJob(app.jobId._id)}
                      disabled={closingJobId === app.jobId._id}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-800 font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-wait"
                    >
                      {closingJobId === app.jobId._id ? "⏳ Closing..." : " Close Job"}
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
