import { useEffect, useState } from 'react';
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
      } catch (err) {
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
      setHrs(hrs.map(hr => hr._id === hrId ? { ...hr, isApproved: true } : hr));
      alert('HR approved successfully');
    } catch (err) {
      alert('Failed to approve HR');
    }
  };

  const handleDisapprove = async (hrId) => {
    try {
      await disapproveHR(hrId);
      setHrs(hrs.map(hr => hr._id === hrId ? { ...hr, isApproved: false } : hr));
      alert('HR disapproved successfully');
    } catch (err) {
      alert('Failed to disapprove HR');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-neutral-900"><p className="text-neutral-400">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-900">
      <Header />
      <div className="flex-grow p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white">HR Management</h1>
            <p className="text-neutral-400 mt-2">Approve or disapprove HR applications</p>
          </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-600 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {hrs.length === 0 ? (
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-8 text-center">
            <p className="text-neutral-400 text-lg">No HR applications found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hrs.map((hr, index) => (
              <motion.div 
                key={hr._id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-neutral-800 border border-neutral-700 rounded-lg p-6"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white">{hr.username}</h3>
                  <p className="text-neutral-400 text-sm">{hr.email}</p>
                </div>

                <div className="mb-6">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    hr.isApproved 
                      ? 'bg-green-900/50 border border-green-600 text-green-300' 
                      : 'bg-yellow-900/50 border border-yellow-600 text-yellow-300'
                  }`}>
                    {hr.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={() => handleApprove(hr._id)}
                    disabled={hr.isApproved}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    {hr.isApproved ? 'Approved' : 'Approve'}
                  </button>
                  <button 
                    onClick={() => handleDisapprove(hr._id)}
                    disabled={!hr.isApproved}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    {!hr.isApproved ? 'Disapproved' : 'Disapprove'}
                  </button>
                </div>
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
