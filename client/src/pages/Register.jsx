import { useState } from 'react';
import toast from 'react-hot-toast';
import { registerUser } from '../api/authApi';
import { motion } from 'framer-motion';

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
        toast.success(res.message);
        setForm({ username: '', email: '', password: '', role: 'candidate' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-4 relative overflow-hidden select-none">

      {/* Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/20 blur-[150px]" />
      <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-purple-600/20 blur-[150px]" />

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
          Create Account
        </h2>

        {error && (
          <div className="mb-5 p-4 text-sm bg-red-900/40 border border-red-700 text-red-300 rounded-xl text-center">
            {error}
          </div>
        )}

        {[
          {label: "Username", type: "text", name: "username", placeholder: "yourname123"},
          {label: "Email", type: "email", name: "email", placeholder: "mail@example.com"},
          {label: "Password", type: "password", name: "password", placeholder: "********"},
        ].map((field) => (
          <div className="mb-5" key={field.name}>
            <label className="block text-neutral-300 font-semibold mb-2 text-sm sm:text-base">
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              required
              value={form[field.name]}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl
              focus:border-blue-500 transition text-sm sm:text-base"
            />
          </div>
        ))}

        <div className="mb-6">
          <label className="block text-neutral-300 font-semibold mb-2 text-sm sm:text-base">
            Select Role
          </label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl
            focus:border-blue-500 transition text-sm sm:text-base"
          >
            <option value="candidate">Candidate</option>
            <option value="hr">HR</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold
          bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90
          disabled:opacity-50 disabled:cursor-not-allowed
          text-sm sm:text-base transition"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="mt-6 text-center text-neutral-400 text-sm sm:text-base">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition">
            Login here
          </a>
        </p>
      </motion.form>
    </div>
  );
};

export default Register;
