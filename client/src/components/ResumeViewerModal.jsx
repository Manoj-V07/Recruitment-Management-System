import PropTypes from 'prop-types';

export default function ResumeViewerModal({ applicationId, filename, onClose }) {

  const handleViewResume = () => {
    const token = localStorage.getItem('token');
    const API = import.meta.env.VITE_API_URL;
    window.open(`${API}/resume/view/${applicationId}?token=${token}`, '_blank');
  };

  const handleDownload = () => {
    const API = import.meta.env.VITE_API_URL;
    window.location.href = `${API}/resume/download/${applicationId}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-neutral-900 p-8 rounded-xl max-w-sm">
        <h2 className="text-xl font-bold text-white mb-6">
          {filename || 'Resume'}
        </h2>

        <div className="flex flex-col gap-3">
          <button onClick={handleViewResume} className="px-6 py-3 bg-green-600 rounded-lg">
            View Resume
          </button>

          <button onClick={handleDownload} className="px-6 py-3 bg-blue-600 rounded-lg">
            Download
          </button>

          <button onClick={onClose} className="px-6 py-3 bg-neutral-700 rounded-lg">
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
