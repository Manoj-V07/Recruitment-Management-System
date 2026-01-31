import PropTypes from 'prop-types';

export default function ResumeViewerModal({ applicationId, filename, onClose }) {
  const API = import.meta.env.VITE_API_URL;

  const handleViewResume = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please login again.');
      return;
    }

    // Open PDF directly in new tab (NO fetch, NO iframe, NO CORS)
    window.open(
      `${API}/resume/view/${applicationId}?token=${token}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleDownload = () => {
    // Browser-handled download (NO fetch, NO CORS)
    window.location.href = `${API}/resume/download/${applicationId}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-neutral-900 p-8 rounded-xl max-w-sm">
        <h2 className="text-xl font-bold text-white mb-6">
          {filename || 'Resume'}
        </h2>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleViewResume}
            className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700"
          >
            View Resume
          </button>

          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Download
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3 bg-neutral-700 rounded-lg hover:bg-neutral-600"
          >
            Close
          </button>
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