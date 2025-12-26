import { useState } from 'react';
import { loginUser } from '../api/authApi';
import { motion } from 'framer-motion';

const Login = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
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
      const res = await loginUser(form);

      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));

        if (res.user.role === 'admin') {
          window.location.href = '/admin';
        } else if (res.user.role === 'hr') {
          if (!res.user.isApproved) {
            setError('Your HR account is pending admin approval. Please wait for approval.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return;
          }
          window.location.href = '/hr';
        } else {
          window.location.href = '/jobs';
        }
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 p-4">
      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-neutral-800 border border-neutral-700 rounded-lg p-8 w-full max-w-md" 
        onSubmit={handleSubmit}
      >
        <h2 className='text-3xl font-bold text-center text-white mb-8'>Login</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-600 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-5">
          <label className="block text-neutral-300 font-semibold mb-2">Email</label>
          <input 
            type="email" 
            name="email" 
            className="w-full px-4 py-2 bg-neutral-900 border-2 border-neutral-700 text-white rounded-lg focus:outline-none focus:border-blue-500 transition-colors" 
            placeholder="Enter your email" 
            value={form.email} 
            onChange={handleChange} 
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-neutral-300 font-semibold mb-2">Password</label>
          <input 
            type="password" 
            name="password" 
            className="w-full px-4 py-2 bg-neutral-900 border-2 border-neutral-700 text-white rounded-lg focus:outline-none focus:border-blue-500 transition-colors" 
            placeholder="Enter your password" 
            value={form.password} 
            onChange={handleChange} 
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-bold py-3 rounded-lg transition-colors duration-200"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-center text-neutral-400 mt-4">
          Don't have an account? <a href="/register" className="text-blue-400 hover:text-blue-300 font-semibold">Register here</a>
        </p>
      </motion.form>
    </div>
  );
};

export default Login;
