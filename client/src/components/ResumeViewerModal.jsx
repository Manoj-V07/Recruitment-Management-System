import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function ResumeViewerModal({ applicationId, filename, onClose }) {
  const [resumeUrl, setResumeUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const API = import.meta.env.VITE_API_URL;

        // For PDF preview, we'll use the view endpoint directly with auth token in URL
        const isPdf = filename?.toLowerCase().endsWith('.pdf');
        
        if (isPdf) {
          // Set the URL with token as query parameter for iframe to work
          setResumeUrl(`${API}/resume/view/${applicationId}?token=${token}`);
        } else {
          setError('Only PDF files can be previewed');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Load error:', err);
        setError('Failed to load resume');
        setLoading(false);
      }
    };

    load();
  }, [applicationId, filename]);

  const isPdf = filename?.toLowerCase().endsWith('.pdf');

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
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download resume');
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="w-[90%] h-[90%] bg-neutral-900 rounded-xl flex flex-col">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{filename}</h2>
          <div className="flex gap-2">
            {isPdf && resumeUrl && (
              <button
                onClick={() => window.open(resumeUrl, '_blank')}
                className="px-4 py-2 bg-green-600 rounded"
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
            <button onClick={onClose} className="px-4 py-2 bg-neutral-700 rounded">
              Close
            </button>
          </div>
        </div>

        {isPdf && resumeUrl ? (
          <iframe
            src={resumeUrl}
            className="flex-grow w-full"
            title="Resume Preview"
          />
        ) : (
          <div className="flex-grow flex items-center justify-center text-neutral-400">
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
