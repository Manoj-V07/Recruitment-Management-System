import { useEffect, useState } from 'react';
import { getHRs, approveHR, disapproveHR } from '../api/authApi';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
    return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="flex-grow p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">HR Management</h1>
            <p className="text-gray-600 mt-2">Approve or disapprove HR applications</p>
          </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {hrs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg">No HR applications found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hrs.map(hr => (
              <div key={hr._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{hr.username}</h3>
                  <p className="text-gray-600 text-sm">{hr.email}</p>
                </div>

                <div className="mb-6">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    hr.isApproved 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {hr.isApproved ? '✓ Approved' : '⏳ Pending'}
                  </span>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={() => handleApprove(hr._id)}
                    disabled={hr.isApproved}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    {hr.isApproved ? '✓ Approved' : 'Approve'}
                  </button>
                  <button 
                    onClick={() => handleDisapprove(hr._id)}
                    disabled={!hr.isApproved}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    {!hr.isApproved ? '✕ Disapproved' : 'Disapprove'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
