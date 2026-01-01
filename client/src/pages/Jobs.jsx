import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getOpenJobs } from '../api/jobApi';
import { applyForJob, getMyApplications } from '../api/applicationApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JobDetailsModal from '../components/JobDetailsModal';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Clock } from 'lucide-react';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [myApplications, setMyApplications] = useState([]);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const [selectedJobType, setSelectedJobType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isCandidate = user.role === 'candidate';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const jobsData = await getOpenJobs();
        setJobs(jobsData);

        if (isCandidate) {
          const apps = await getMyApplications();
          setMyApplications(apps);
        }
      } catch {
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isCandidate]);

  const handleApply = async (jobId, resumeFile) => {
    if (!isCandidate) return toast.error('Only candidates can apply');

    try {
      setApplyingJobId(jobId);
      const formData = new FormData();
      formData.append('resume', resumeFile);
      await applyForJob(jobId, formData);
      setMyApplications(await getMyApplications());
      setSelectedJob(null);
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplyingJobId(null);
    }
  };

  const hasApplied = jobId =>
    myApplications.some(app => app.jobId?._id === jobId);

  const filteredJobs = jobs.filter(job => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      job.jobTitle.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      job.requiredSkills?.some(s => s.toLowerCase().includes(q));

    const matchesType =
      selectedJobType === 'all' || job.jobType === selectedJobType;

    const matchesLocation =
      selectedLocation === 'all' || job.location === selectedLocation;

    let matchesExp = true;
    if (selectedExperience !== 'all') {
      const exp = job.experience || 0;
      if (selectedExperience === '0-2') matchesExp = exp <= 2;
      if (selectedExperience === '2-5') matchesExp = exp > 2 && exp <= 5;
      if (selectedExperience === '5+') matchesExp = exp > 5;
    }

    return matchesSearch && matchesType && matchesLocation && matchesExp;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <p className="text-neutral-400 text-lg animate-pulse">
          Curating opportunities…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/20 blur-[160px]" />
      <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-purple-500/20 blur-[160px]" />

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-5 py-16">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Explore{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Real Opportunities
            </span>
          </h1>
          <p className="text-neutral-400 mt-4 max-w-2xl text-lg">
            High-quality roles from verified companies. Apply confidently.
          </p>

          <div className="mt-8 max-w-2xl">
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search roles, skills or location"
              className="w-full px-6 py-4 rounded-2xl bg-neutral-900/70 backdrop-blur border border-neutral-700 focus:ring-2 focus:ring-blue-500/40 transition text-lg"
            />
          </div>
        </motion.div>

        {/* FILTER BAR */}
        <div className="mb-14 rounded-3xl bg-neutral-900/70 backdrop-blur border border-neutral-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedJobType}
              onChange={e => setSelectedJobType(e.target.value)}
              className="rounded-xl bg-neutral-950 border border-neutral-700 px-4 py-3"
            >
              <option value="all">All Job Types</option>
              {[...new Set(jobs.map(j => j.jobType))].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="rounded-xl bg-neutral-950 border border-neutral-700 px-4 py-3"
            >
              <option value="all">All Locations</option>
              {[...new Set(jobs.map(j => j.location))].map(l => (
                <option key={l}>{l}</option>
              ))}
            </select>

            <select
              value={selectedExperience}
              onChange={e => setSelectedExperience(e.target.value)}
              className="rounded-xl bg-neutral-950 border border-neutral-700 px-4 py-3"
            >
              <option value="all">All Experience</option>
              <option value="0-2">0–2 years</option>
              <option value="2-5">2–5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>
        </div>

        {/* JOB GRID */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-24 text-neutral-400 text-lg">
            No matching jobs found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {filteredJobs.map((job, i) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -12 }}
                onClick={() => setSelectedJob(job)}
                className="group relative rounded-3xl bg-neutral-900/80 border border-neutral-800 p-7 cursor-pointer hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all"
              >
                <h3 className="text-xl font-bold mb-1">
                  {job.jobTitle}
                </h3>

                <div className="flex flex-wrap gap-4 text-sm text-neutral-400 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} /> {job.jobType}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {job.experience || '—'} yrs
                  </span>
                </div>

                <p className="text-neutral-300 text-sm line-clamp-3 mb-6">
                  {job.jobDescription}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {job.requiredSkills?.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-neutral-800 px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedJob(job);
                  }}
                  className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition"
                >
                  View Details
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <p className="text-center text-neutral-500 mt-20">
          Showing {filteredJobs.length} opportunities
        </p>
      </main>

      <Footer />

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={handleApply}
          isApplying={applyingJobId === selectedJob._id}
          hasApplied={hasApplied(selectedJob._id)}
        />
      )}
    </div>
  );
}
