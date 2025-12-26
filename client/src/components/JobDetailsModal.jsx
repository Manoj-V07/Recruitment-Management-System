import { useState } from 'react';

export default function JobDetailsModal({ job, onClose, onApply, isApplying, hasApplied }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF or Word document');
        setResumeFile(null);
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setResumeFile(null);
        return;
      }
      setError('');
      setResumeFile(file);
    }
  };

  const handleSubmit = () => {
    if (!resumeFile) {
      setError('Please upload your resume');
      return;
    }
    if (!confirmChecked) {
      setError('Please confirm that the information is correct');
      return;
    }
    onApply(job._id, resumeFile);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-800 border-b border-neutral-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Job Details</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Job Information */}
          <div className="mb-6">
            <h3 className="text-3xl font-bold text-white mb-3">{job.jobTitle}</h3>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center text-neutral-300">
                <span className="mr-2">Location:</span>
                <span>{job.location}</span>
              </div>
              <div className="flex items-center text-neutral-300">
                <span className="mr-2">Type:</span>
                <span>{job.jobType}</span>
              </div>
              {job.experience !== undefined && (
                <div className="flex items-center text-neutral-300">
                  <span className="mr-2">Experience:</span>
                  <span>{job.experience} years</span>
                </div>
              )}
              {job.vacancies && (
                <div className="flex items-center text-neutral-300">
                  <span className="mr-2">Vacancies:</span>
                  <span>{job.vacancies}</span>
                </div>
              )}
              {!job.isOpen && (
                <div className="flex items-center">
                  <span className="bg-red-900/50 border border-red-700 text-red-300 text-sm font-bold px-3 py-1 rounded-full">
                    CLOSED
                  </span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-white mb-2">Job Description</h4>
              <p className="text-neutral-300 whitespace-pre-line">{job.jobDescription}</p>
            </div>

            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-white mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-900/50 text-blue-300 border border-blue-700 text-sm font-semibold px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Application Form */}
          {!hasApplied && job.isOpen && (
            <div className="border-t border-neutral-700 pt-6">
              <h4 className="text-xl font-bold text-white mb-4">Apply for this Position</h4>
              
              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-600 text-red-200 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Resume Upload */}
              <div className="mb-4">
                <label className="block text-neutral-300 font-semibold mb-2">
                  Upload Resume <span className="text-red-400">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 bg-neutral-900 border-2 border-neutral-700 text-white rounded-lg focus:outline-none focus:border-blue-500"
                />
                <p className="text-sm text-neutral-500 mt-1">
                  Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
                </p>
                {resumeFile && (
                  <p className="text-sm text-green-400 mt-2">
                    File selected: {resumeFile.name}
                  </p>
                )}
              </div>

              {/* Confirmation Checkbox */}
              <div className="mb-6">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmChecked}
                    onChange={(e) => setConfirmChecked(e.target.checked)}
                    className="mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-neutral-600 rounded bg-neutral-900"
                  />
                  <span className="text-neutral-300">
                    I confirm that the uploaded resume is mine and I possess the required skills mentioned in the job description.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={isApplying || !resumeFile || !confirmChecked}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
                >
                  {isApplying ? 'Submitting Application...' : 'Submit Application'}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!job.isOpen && (
            <div className="border-t border-neutral-700 pt-6">
              <div className="bg-red-900/30 border border-red-600 text-red-200 p-4 rounded-lg text-center">
                <p className="font-semibold">This job opening is closed and no longer accepting applications</p>
              </div>
            </div>
          )}

          {hasApplied && job.isOpen && (
            <div className="border-t border-neutral-700 pt-6">
              <div className="bg-blue-900/30 border border-blue-600 text-blue-200 p-4 rounded-lg text-center">
                <p className="font-semibold">You have already applied for this position</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
