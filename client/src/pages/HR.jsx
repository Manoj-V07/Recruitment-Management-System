import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { createJob, getMyJobs } from '../api/jobApi';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function HR() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState(0);
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('Full-Time');
  const [vacancies, setVacancies] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsApproved(user.isApproved || false);

    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await getMyJobs();
        setJobs(data.jobs || []);
      } catch {
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const submit = async () => {
    if (!isApproved) return toast.error('Your account is not approved yet.');

    if (!title.trim() || !description.trim() || !skills.trim() || !location.trim() || vacancies < 1) {
      toast.error('Please fill all required fields correctly.');
      return;
    }

    try {
      setLoading(true);
      await createJob({
        jobTitle: title,
        jobDescription: description,
        requiredSkills: skills,
        experience,
        location,
        jobType,
        vacancies
      });

      toast.success('Job Created Successfully!');
      setTitle('');
      setDescription('');
      setSkills('');
      setExperience(0);
      setLocation('');
      setJobType('Full-Time');
      setVacancies(1);
      setShowForm(false);

      const data = await getMyJobs();
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden flex flex-col">

      {/* Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-purple-600/20 blur-[160px] pointer-events-none" />

      <Header />

      <div className="flex-grow px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14 max-w-7xl mx-auto w-full relative z-10">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 sm:mb-12 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            HR Dashboard
          </h1>
          <p className="text-neutral-400 mt-2 sm:mt-3 lg:mt-3 text-sm sm:text-base lg:text-lg">
            Create and manage job postings efficiently.
          </p>
        </motion.div>

        {/* Account Status Banner */}
        {!isApproved && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-yellow-900/40 border border-yellow-600 backdrop-blur flex gap-3 sm:gap-4 flex-col sm:flex-row">
            <span className="text-2xl sm:text-3xl flex-shrink-0">⚠️</span>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-yellow-300">Account Pending Approval</h3>
              <p className="text-yellow-200 mt-1 text-xs sm:text-sm">
                You cannot create jobs until approved by Admin.
              </p>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="mb-8 p-6 rounded-2xl bg-green-900/40 border border-green-600 backdrop-blur flex gap-4 items-center">
            <span className="text-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
              </svg>
            </span>
            <p className="text-green-200 font-semibold">
              Your account is approved. You can now create job postings.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="mb-6 sm:mb-8 p-4 sm:p-5 rounded-lg sm:rounded-xl bg-red-900/40 border border-red-700 text-red-300 text-xs sm:text-sm">
            {error}
          </p>
        )}

        {/* Create Job Form Container */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl lg:rounded-3xl p-5 sm:p-8 backdrop-blur mb-8 sm:mb-12 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-bold">Create New Job</h2>
            <button
              onClick={() => isApproved && setShowForm(!showForm)}
              disabled={!isApproved}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all text-xs sm:text-sm ${
                isApproved
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
                  : "bg-neutral-700 cursor-not-allowed"
              }`}
            >
              {showForm ? "Close" : "+ New Job"}
            </button>
          </div>

          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 border-t border-neutral-700 pt-6 sm:pt-8"
            >
              <div>
                <label className="font-semibold text-neutral-300 mb-1 block text-xs sm:text-sm">Job Title *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Senior MERN Developer"
                  className="w-full bg-neutral-950 px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-neutral-700 focus:border-blue-500 transition text-xs sm:text-base"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-300 mb-1 block text-xs sm:text-sm">Description *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-neutral-950 px-3 sm:px-5 py-2.5 sm:py-3 h-24 sm:h-28 rounded-lg sm:rounded-xl border border-neutral-700 focus:border-blue-500 transition text-xs sm:text-base"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-300 mb-1 block text-xs sm:text-sm">Required Skills *</label>
                <input
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  placeholder="React, Node.js, MongoDB"
                  className="w-full bg-neutral-950 px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-neutral-700 focus:border-blue-500 transition text-xs sm:text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="font-semibold text-neutral-300 mb-1 block text-xs sm:text-sm">Experience (years)</label>
                  <input
                    type="number"
                    min="0"
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    className="w-full bg-neutral-950 px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-neutral-700 focus:border-blue-500 transition text-xs sm:text-base"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-300 mb-1 block text-xs sm:text-sm">Vacancies *</label>
                  <input
                    type="number"
                    min="1"
                    value={vacancies}
                    onChange={e => setVacancies(e.target.value)}
                    className="w-full bg-neutral-950 px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-neutral-700 focus:border-blue-500 transition text-xs sm:text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="font-semibold text-neutral-300 mb-1 block text-xs sm:text-sm">Location *</label>
                  <input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full bg-neutral-950 px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-neutral-700 focus:border-blue-500 transition text-xs sm:text-base"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-300 mb-1 block text-xs sm:text-sm">Job Type</label>
                  <select
                    value={jobType}
                    onChange={e => setJobType(e.target.value)}
                    className="w-full bg-neutral-950 px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-neutral-700 focus:border-blue-500 transition text-xs sm:text-base"
                  >
                    <option>Full-Time</option>
                    <option>Part-Time</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>

              <button
                onClick={submit}
                disabled={loading}
                className="w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 font-bold hover:opacity-90 disabled:opacity-50 text-xs sm:text-base"
              >
                {loading ? "Creating..." : "Create Job"}
              </button>
            </motion.div>
          )}
        </div>

        {/* Job List */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-10 backdrop-blur">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10">My Jobs</h2>

          {jobs.length === 0 ? (
            <p className="text-center py-8 sm:py-10 text-neutral-500 text-xs sm:text-sm">No jobs created yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {jobs.map((job, i) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 sm:p-7 rounded-xl sm:rounded-2xl bg-neutral-950/60 border border-neutral-800 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-600/10 transition-all"
                >
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{job.jobTitle}</h3>
                  <p className="text-neutral-400 text-xs sm:text-sm mb-4 line-clamp-2">{job.jobDescription}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs bg-blue-900/50 border border-blue-700">{job.jobType}</span>
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs bg-purple-900/50 border border-purple-700">{job.location}</span>
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs bg-neutral-700 border border-neutral-600">
                      {job.vacancies} {job.vacancies === 1 ? "Vacancy" : "Vacancies"}
                    </span>
                    {!job.isOpen && (
                      <span className="px-2 sm:px-3 py-1 rounded-full text-xs bg-red-900/50 border border-red-700 text-red-300">
                        CLOSED
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => navigate('/job-applications', { state: { jobId: job._id } })}
                    className="w-full mt-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-semibold hover:opacity-90 text-xs sm:text-sm"
                  >
                    View Applications
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
