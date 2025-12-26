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
        
        // Get file extension
        const ext = filename?.split('.').pop()?.toLowerCase() || 'pdf';
        setFileType(ext);
        
        // Fetch the resume with authentication
        const response = await fetch(`http://localhost:5000/resume/view/${applicationId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to load resume');
        }
        
        // Create blob URL for display
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setResumeUrl(url);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load resume');
        setLoading(false);
      }
    };

    if (applicationId) {
      loadResume();
    }

    // Cleanup blob URL when component unmounts
    return () => {
      if (resumeUrl && resumeUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(resumeUrl);
      }
    };
  }, [applicationId, filename]);

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/resume/download/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download resume');
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
      alert('Failed to download resume');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-neutral-700">
          <h2 className="text-2xl font-bold text-white">Resume Viewer</h2>
          <div className="flex gap-4 items-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleDownload();
              }}
              className="text-blue-400 hover:text-blue-300 px-4 py-2 font-semibold transition-colors flex items-center gap-2 underline decoration-2 underline-offset-4 hover:decoration-blue-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download
            </a>
            <button
              onClick={onClose}
              className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-hidden bg-neutral-900">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-neutral-400">Loading resume...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-400">
                <p className="text-xl font-semibold mb-2">Error</p>
                <p>{error}</p>
              </div>
            </div>
          ) : fileType === 'pdf' ? (
            <iframe
              src={`${resumeUrl}#toolbar=1`}
              className="w-full h-full border-0"
              title="Resume PDF Viewer"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center bg-neutral-800 border border-neutral-700 p-8 rounded-lg max-w-md">
                <div className="mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{filename}</h3>
                <p className="text-neutral-400 mb-4">
                  Preview is not available for this file type (.{fileType})
                </p>
                <p className="text-neutral-400 mb-6">
                  Please download the file to view it.
                </p>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownload();
                  }}
                  className="text-blue-400 hover:text-blue-300 px-6 py-3 font-semibold transition-colors inline-flex items-center gap-2 underline decoration-2 underline-offset-4 hover:decoration-blue-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download Resume
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-700 bg-neutral-800 text-center text-sm text-neutral-400">
          {filename || 'resume.pdf'}
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
