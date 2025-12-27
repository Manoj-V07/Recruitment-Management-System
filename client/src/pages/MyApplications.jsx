import { useEffect, useState } from 'react';
import { getMyApplications } from '../api/applicationApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await getMyApplications();
        setApplications(data);
      } catch {
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter(app =>
    filter === 'all' ? true : app.status === filter
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted': return 'bg-green-900/50 border-green-600 text-green-300';
      case 'rejected': return 'bg-red-900/50 border-red-600 text-red-300';
      default: return 'bg-blue-900/50 border-blue-600 text-blue-300';
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'shortlisted') return "Shortlisted";
    if (status === 'rejected') return "Rejected";
    return "Applied";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <p className="animate-pulse text-neutral-500 text-lg">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">
      
      {/* Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/20 blur-[150px]" />
      <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-purple-500/20 blur-[150px]" />

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            My Applications
          </h1>
          <p className="text-neutral-400 text-lg mt-3">
            Track job statuses and follow your hiring journey.
          </p>
        </motion.div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-900/40 border border-red-700 text-red-300">
            {error}
          </div>
        )}

        {/* FILTER BUTTONS */}
        <div className="flex flex-wrap gap-4 mb-10">
          {["all", "applied", "shortlisted", "rejected"].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-3 rounded-xl font-semibold capitalize transition-all ${
                filter === type
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-700/30"
                  : "bg-neutral-900/60 border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              }`}
            >
              {type} ({applications.filter(a => type === "all" ? true : a.status === type).length})
            </button>
          ))}
        </div>

        {/* LIST */}
        {filteredApplications.length === 0 ? (
          <div className="text-center p-16 bg-neutral-900/60 border border-neutral-800 rounded-3xl backdrop-blur">
            <p className="text-neutral-400 text-lg">
              {filter === "all"
                ? "You haven't applied for any jobs yet. Start exploring!"
                : `No ${filter} applications found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((application, i) => (
              <motion.div
                key={application._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-neutral-800 bg-neutral-900/70 backdrop-blur rounded-3xl p-8 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-600/10 transition-all"
              >
                <div className="flex justify-between items-start">
                  
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      {application.jobId?.jobTitle || "Unknown Job"}
                    </h3>
                    <div className="flex text-neutral-400 text-sm gap-4 mb-4">
                      <span>📍 {application.jobId?.location || "N/A"}</span>
                      <span>💼 {application.jobId?.jobType || "N/A"}</span>
                    </div>
                    <p className="text-neutral-500 text-sm">
                      Applied on:{" "}
                      {new Date(application.appliedAt).toLocaleDateString("en-US", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  </div>

                  <span className={`px-5 py-2 rounded-full text-sm font-bold border ${getStatusColor(application.status)}`}>
                    {getStatusLabel(application.status)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <p className="text-center text-neutral-500 mt-12">
          Showing {filteredApplications.length} application(s)
        </p>

      </main>

      <Footer />
    </div>
  );
}
