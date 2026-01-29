import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function ResumeViewerModal({ applicationId, filename, onClose }) {
  const [resumeUrl, setResumeUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const API = import.meta.env.VITE_API_URL;

    if (!token) {
      setError('Session expired. Please login again.');
      setLoading(false);
      return;
    }

    // Construct the stream URL with token as query param
    // This allows the iframe to access the PDF endpoint with authentication
    const streamUrl = `${API}/resume/view/${applicationId}?token=${token}`;
    setResumeUrl(streamUrl);
    setLoading(false);
  }, [applicationId]);

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const API = import.meta.env.VITE_API_URL;

      const response = await fetch(
        `${API}/resume/download/${applicationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
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
      console.error(err);
      alert('Failed to download resume');
    }
  };

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-neutral-900 p-6 rounded-xl text-red-400 text-center">
          <p>{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-neutral-700 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  /* ================= MODAL ================= */

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-2 sm:px-4">
      <div className="w-full max-w-6xl h-[90vh] bg-neutral-900 rounded-xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="p-4 flex justify-between items-center border-b border-neutral-800">
          <h2 className="text-lg font-bold truncate">{filename}</h2>

          <div className="flex gap-2">
            <button
              onClick={() => window.open(resumeUrl, '_blank')}
              className="px-4 py-2 bg-green-600 rounded"
            >
              Open in New Tab
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 rounded"
            >
              Download
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-700 rounded"
            >
              Close
            </button>
          </div>
        </div>

        {/* IFRAME */}
        <iframe
          src={resumeUrl}
          title="Resume Preview"
          className="flex-1 w-full border-none"
        />
      </div>
    </div>
  );
}

ResumeViewerModal.propTypes = {
  applicationId: PropTypes.string.isRequired,
  filename: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
