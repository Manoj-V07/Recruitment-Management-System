import PropTypes from 'prop-types';

export default function ResumeViewerModal({ applicationId, filename, onClose }) {
  const handleViewResume = () => {
    const token = localStorage.getItem('token');
    const API = import.meta.env.VITE_API_URL;
    
    if (!token) {
      alert('Session expired. Please login again.');
      return;
    }

    const resumeUrl = `${API}/resume/view/${applicationId}?token=${token}`;
    window.open(resumeUrl, '_blank');
  };

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

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-2 sm:px-4">
      <div className="bg-neutral-900 p-8 rounded-xl max-w-sm">
        <h2 className="text-xl font-bold text-white mb-6">{filename || 'Resume'}</h2>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleViewResume}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
          >
            View Resume
          </button>

          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Download
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition"
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
