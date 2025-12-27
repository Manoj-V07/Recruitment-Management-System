import { useState } from 'react';
import { loginUser } from '../api/authApi';
import { motion } from 'framer-motion';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
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

        if (res.user.role === 'admin') return (window.location.href = '/admin');
        if (res.user.role === 'hr') {
          if (!res.user.isApproved) {
            setError('Your HR account is still pending admin approval.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return;
          }
          return (window.location.href = '/hr');
        }
        return (window.location.href = '/jobs');
      }

      setError(res.message || 'Login failed');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white relative overflow-hidden px-4">

      {/* Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-purple-600/20 blur-[150px] pointer-events-none" />

      {/* Login Card */}
      <motion.form
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        onSubmit={handleSubmit}
        className="relative bg-neutral-900/80 backdrop-blur-xl border border-neutral-800
        rounded-3xl p-8 sm:p-10 w-full max-w-sm sm:max-w-md shadow-[0_0_40px_rgba(0,0,0,0.6)]"
      >

        <h2 className="text-4xl sm:text-5xl font-extrabold text-center
        bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-8">
          Login
        </h2>

        {error && (
          <div className="mb-5 p-4 text-sm bg-red-900/40 border border-red-700 text-red-300 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* EMAIL */}
        <div className="mb-5">
          <label className="block text-neutral-300 font-semibold mb-2 text-sm sm:text-base">Email</label>
          <input
            type="email"
            name="email"
            placeholder="example@mail.com"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700
            focus:border-blue-500 text-sm sm:text-base transition"
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-6">
          <label className="block text-neutral-300 font-semibold mb-2 text-sm sm:text-base">Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700
            focus:border-blue-500 text-sm sm:text-base transition"
          />
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold
          bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90
          disabled:opacity-50 disabled:cursor-not-allowed
          text-sm sm:text-base transition"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="mt-6 text-center text-neutral-400 text-sm sm:text-base">
          Don’t have an account?{' '}
          <a
            href="/register"
            className="font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            Register
          </a>
        </p>
      </motion.form>
    </div>
  );
};

export default Login;
