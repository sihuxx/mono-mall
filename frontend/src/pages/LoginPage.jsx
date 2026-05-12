import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate('/');
  };

  return (
    <div className="py-24 max-w-sm mx-auto">
      <p className="text-xs tracking-[0.3em] text-neutral-500 mb-3 text-center">SIGN IN</p>
      <h1 className="text-3xl font-light tracking-tight mb-12 text-center">Welcome back</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs tracking-[0.2em] text-neutral-500 mb-2">EMAIL</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs tracking-[0.2em] text-neutral-500 mb-2">PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b border-neutral-200 py-3 outline-none focus:border-black transition text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-4 text-sm tracking-[0.2em] hover:bg-neutral-800 transition disabled:bg-neutral-400"
        >
          {loading ? 'SIGNING IN...' : 'SIGN IN'}
        </button>
      </form>

      <p className="text-center text-xs text-neutral-500 mt-8">
        계정이 없으신가요?{' '}
        <Link to="/signup" className="underline text-black">회원가입</Link>
      </p>
    </div>
  );
}
