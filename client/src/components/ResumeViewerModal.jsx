import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function ResumeViewerModal({ applicationId, filename, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [fileType, setFileType] = useState('');

  useEffect(() => {
    const loadResume = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');

        const ext = filename?.split('.').pop()?.toLowerCase() || 'pdf';
        setFileType(ext);

        const response = await fetch(`http://localhost:5000/resume/view/${applicationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error();

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setResumeUrl(url);
        setLoading(false);
      } catch {
        setError('Failed to load resume');
        setLoading(false);
      }
    };

    if (applicationId) loadResume();
    return () => resumeUrl && resumeUrl.startsWith('blob:') && URL.revokeObjectURL(resumeUrl);

  }, [applicationId, filename]);

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/resume/download/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error();

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'resume.pdf';
      a.click();
      URL.revokeObjectURL(url);

    } catch {
      alert('Failed to download resume');
    }
  };

  const clickBackdrop = (e) => e.target === e.currentTarget && onClose();

  return (
    <div
      onClick={clickBackdrop}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200] p-6"
    >

      {/* Modal Container */}
      <div className="w-full max-w-6xl h-[90vh] flex flex-col bg-neutral-900/80 backdrop-blur-xl
      border border-neutral-800 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-neutral-800 bg-neutral-900/90">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Resume Viewer
          </h2>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="px-5 py-2 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition disabled:opacity-50"
            >
              Download
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition font-semibold"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow bg-neutral-950 overflow-hidden flex items-center justify-center">

          {loading && (
            <div className="text-center animate-in fade-in duration-200">
              <div className="animate-spin h-14 w-14 rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="text-neutral-400 mt-4">Rendering document...</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center">
              <p className="text-red-400 text-xl font-bold mb-2">Error</p>
              <p className="text-neutral-400">{error}</p>
            </div>
          )}

          {!loading && !error && (
            fileType === "pdf" ? (
              <iframe
                src={`${resumeUrl}#toolbar=1`}
                className="w-full h-full border-none"
                title="Resume Viewer"
              />
            ) : (
              <div className="text-center max-w-md p-10 bg-neutral-900/60 border border-neutral-800 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-neutral-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>

                <h3 className="text-2xl font-bold text-white mb-2">{filename}</h3>
                <p className="text-neutral-400 mb-4">Preview not supported for <strong>.{fileType}</strong> files</p>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition"
                >
                  Download to View
                </button>
              </div>
            )
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 text-neutral-500 text-sm bg-neutral-900/90">
          {filename || "resume.pdf"}
        </div>
      </div>
    </div>
  );
}

ResumeViewerModal.propTypes = {
  applicationId: PropTypes.string.isRequired,
  filename: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
