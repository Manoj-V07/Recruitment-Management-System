import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getHRs, approveHR, disapproveHR } from '../api/authApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function Admin() {
  const [hrs, setHrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHRs = async () => {
      try {
        setLoading(true);
        const data = await getHRs();
        setHrs(data);
      } catch {
        setError('Failed to load HRs');
      } finally {
        setLoading(false);
      }
    };
    fetchHRs();
  }, []);

  const handleApprove = async (hrId) => {
    try {
      await approveHR(hrId);
      setHrs(prev => prev.map(hr => hr._id === hrId ? { ...hr, isApproved: true } : hr));
      toast.success('HR approved successfully');
    } catch {
      toast.error('Failed to approve HR');
    }
  };

  const handleDisapprove = async (hrId) => {
    try {
      await disapproveHR(hrId);
      setHrs(prev => prev.map(hr => hr._id === hrId ? { ...hr, isApproved: false } : hr));
      toast.success('HR disapproved successfully');
    } catch {
      toast.error('Failed to disapprove HR');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden flex flex-col">
      
      {/* Glow Background */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/20 blur-[140px]" />
      <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-purple-500/20 blur-[160px]" />

      <Header />

      <main className="flex-grow px-6 py-16 max-w-7xl mx-auto relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14"
        >
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            HR Management
          </h1>
          <p className="text-neutral-400 mt-4 text-lg">
            Approve or remove HR accounts with control & transparency.
          </p>
        </motion.div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-900/40 border border-red-700 text-red-300">
            {error}
          </div>
        )}

        {hrs.length === 0 ? (
          <div className="text-center p-16 bg-neutral-900/70 border border-neutral-800 rounded-3xl backdrop-blur">
            <p className="text-neutral-400 text-lg">No HR applications found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hrs.map((hr, i) => (
              <motion.div
                key={hr._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-8 rounded-3xl bg-neutral-900/70 backdrop-blur border border-neutral-800 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-600/10 transition-all"
              >
                <h3 className="text-xl font-bold mb-1">{hr.username}</h3>
                <p className="text-neutral-400 mb-6">{hr.email}</p>

                <span className={`inline-block px-4 py-1.5 mb-6 rounded-full text-sm font-semibold border ${
                  hr.isApproved
                    ? "bg-green-900/50 border-green-600 text-green-300"
                    : "bg-yellow-900/50 border-yellow-600 text-yellow-300"
                }`}>
                  {hr.isApproved ? "Approved" : "Pending"}
                </span>

                <div className="space-y-3">
                  <button
                    onClick={() => handleApprove(hr._id)}
                    disabled={hr.isApproved}
                    className={`w-full py-2.5 rounded-xl font-semibold transition-all ${
                      hr.isApproved
                        ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90"
                    }`}
                  >
                    {hr.isApproved ? "Approved" : "Approve"}
                  </button>

                  <button
                    onClick={() => handleDisapprove(hr._id)}
                    disabled={!hr.isApproved}
                    className={`w-full py-2.5 rounded-xl font-semibold transition-all ${
                      !hr.isApproved
                        ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-red-600 to-red-800 hover:opacity-90"
                    }`}
                  >
                    {hr.isApproved ? "Disapprove" : "Disapproved"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
