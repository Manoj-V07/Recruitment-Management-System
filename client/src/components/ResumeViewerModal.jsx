import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';

export default function ResumeViewerModal({ applicationId, filename, onClose }) {
  const [resumeUrl, setResumeUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const iframeRef = useRef(null);
  const loadCountRef = useRef(0);

  /* ===============================
     INITIAL LOAD
     =============================== */
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const API = import.meta.env.VITE_API_URL;

      if (!token) {
        setError('Session expired. Please login again.');
        setLoading(false);
        return;
      }

      const isPdf = filename?.toLowerCase().endsWith('.pdf');

      if (!isPdf) {
        setError('Only PDF files can be previewed');
        setLoading(false);
        return;
      }

      // DO NOT PREFETCH / HEAD CHECK
      setResumeUrl(`${API}/resume/view/${applicationId}?token=${token}`);
      setLoading(false);
    } catch (err) {
      console.error('Load error:', err);
      setError('Failed to load resume');
      setLoading(false);
    }
  }, [applicationId, filename]);

  const isPdf = filename?.toLowerCase().endsWith('.pdf');

  /* ===============================
     IFRAME LOOP GUARD (DEPLOY FIX)
     =============================== */
  const handleIframeLoad = () => {
    loadCountRef.current += 1;

    // Allow initial redirect(s)
    if (loadCountRef.current <= 2) return;

    try {
      const iframeWindow = iframeRef.current?.contentWindow;
      const iframeUrl = iframeWindow?.location?.href;

      // If iframe keeps loading our own SPA → auth redirect loop
      if (iframeUrl && iframeUrl.includes(window.location.origin)) {
        setError('Session expired. Please login again.');
        setResumeUrl(null);
      }
    } catch {
      // Cross-origin access blocked → GOOD (Cloudinary PDF)
    }
  };

  /* ===============================
     DOWNLOAD (UNCHANGED)
     =============================== */
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const API = import.meta.env.VITE_API_URL;

      const response = await fetch(`${API}/resume/download/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        alert('Failed to download resume');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download resume');
    }
  };

  /* ===============================
     UI STATES
     =============================== */
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
        <div className="bg-neutral-900 p-6 rounded-xl text-red-400 text-center max-w-sm">
          <p>{error}</p>
          <div className="mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-700 rounded"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
     MODAL
     =============================== */
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-2 sm:px-4">
      <div
        className="
          w-full
          max-w-6xl
          h-[90vh]
          sm:h-[92vh]
          md:h-[94vh]
          bg-neutral-900
          rounded-xl
          flex
          flex-col
          overflow-hidden
        "
      >
        {/* HEADER */}
        <div className="p-4 flex flex-wrap gap-2 justify-between items-center border-b border-neutral-800">
          <h2 className="text-lg sm:text-xl font-bold truncate max-w-full">
            {filename}
          </h2>

          <div className="flex flex-wrap gap-2">
            {isPdf && resumeUrl && (
              <button
                onClick={() => window.open(resumeUrl, '_blank')}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
              >
                Open in New Tab
              </button>
            )}

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Download
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-700 rounded hover:bg-neutral-600"
            >
              Close
            </button>
          </div>
        </div>

        {/* IFRAME PREVIEW */}
        {isPdf && resumeUrl ? (
          <iframe
            ref={iframeRef}
            src={resumeUrl}
            title="Resume Preview"
            onLoad={handleIframeLoad}
            className="flex-1 w-full min-h-0 border-none"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-400">
            Preview not available
          </div>
        )}
      </div>
    </div>
  );
}

ResumeViewerModal.propTypes = {
  applicationId: PropTypes.string.isRequired,
  filename: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
