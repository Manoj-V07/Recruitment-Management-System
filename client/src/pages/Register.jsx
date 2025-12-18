import { useState } from 'react';
import { registerUser } from '../api/authApi';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'candidate',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await registerUser(form);
      if (res.message) {
        alert(res.message);
        setForm({ username: '', email: '', password: '', role: 'candidate' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <form className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className='text-3xl font-bold text-center text-gray-800 mb-8'>Create Account</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-5">
          <label className="block text-gray-700 font-semibold mb-2">Username</label>
          <input 
            type="text" 
            name="username" 
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors" 
            placeholder="Enter your username" 
            value={form.username} 
            onChange={handleChange} 
            required
          />
        </div>

        <div className="mb-5">
          <label className="block text-gray-700 font-semibold mb-2">Email</label>
          <input 
            type="email" 
            name="email" 
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors" 
            placeholder="Enter your email" 
            value={form.email} 
            onChange={handleChange} 
            required
          />
        </div>

        <div className="mb-5">
          <label className="block text-gray-700 font-semibold mb-2">Password</label>
          <input 
            type="password" 
            name="password" 
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors" 
            placeholder="Enter your password" 
            value={form.password} 
            onChange={handleChange} 
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Select Role</label>
          <select 
            name="role" 
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors bg-white" 
            value={form.role} 
            onChange={handleChange}
          >
            <option value="candidate">Candidate</option>
            <option value="hr">HR</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors duration-200 shadow-lg"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="text-center text-gray-600 mt-4">
          Already have an account? <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">Login here</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
