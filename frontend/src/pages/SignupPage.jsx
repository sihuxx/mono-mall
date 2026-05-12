import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await signup(form.email, form.password, form.username);
    setLoading(false);
    if (ok) navigate('/');
  };

  return (
    <div className="py-24 max-w-sm mx-auto">
      <p className="text-xs tracking-[0.3em] text-neutral-500 mb-3 text-center">SIGN UP</p>
      <h1 className="text-3xl font-light tracking-tight mb-12 text-center">Create account</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs tracking-[0.2em] text-neutral-500 mb-2">USERNAME</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs tracking-[0.2em] text-neutral-500 mb-2">EMAIL</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs tracking-[0.2em] text-neutral-500 mb-2">PASSWORD</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm"
            required
            minLength={4}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-4 text-sm tracking-[0.2em] hover:bg-neutral-800 transition disabled:bg-neutral-400"
        >
          {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
        </button>
      </form>

      <p className="text-center text-xs text-neutral-500 mt-8">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="underline text-black">로그인</Link>
      </p>
    </div>
  );
}
