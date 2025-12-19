import { useState } from 'react';
import { loginUser } from '../api/authApi';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <form className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className='text-3xl font-bold text-center text-gray-800 mb-8'>Login</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

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

        <div className="mb-6">
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

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors duration-200 shadow-lg"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-center text-gray-600 mt-4">
          Don't have an account? <a href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">Register here</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
