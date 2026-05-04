import { useState } from 'react';
import { Logo } from '../../components/material';

interface LoginPageProps {
  onLogin: () => void;
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.477 10.477A3 3 0 0 0 13.5 13.5M6.357 6.357C4.29 7.795 2.878 9.76 2.458 12c1.274 4.057 5.064 7 9.542 7a9.86 9.86 0 0 0 5.641-1.757M9.878 4.121A9.86 9.86 0 0 1 12 4c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 0 1-2.166 3.334" />
    </svg>
  );
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (email === 'admin@puplar.com' && password === 'password') {
        onLogin();
      } else {
        setError('Invalid email or password.');
      }
    }, 700);
  }

  return (
    <div className="flex-1 flex min-h-0">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-[420px] shrink-0 flex-col bg-puplar-900 px-10 py-10 relative overflow-hidden">

        {/* Subtle background texture — layered rings */}
        <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full border border-white/5" />
        <div className="absolute -bottom-20 -right-20 w-[360px] h-[360px] rounded-full border border-white/5" />
        <div className="absolute -bottom-8  -right-8  w-[240px] h-[240px] rounded-full border border-white/[0.07]" />

        {/* Logo */}
        <div className="relative">
          <Logo color="light" className="h-8" />
        </div>

        {/* Headline */}
        <div className="mt-auto relative">
          <p className="font-display font-bold text-[32px] leading-[1.15] tracking-[-0.025em] text-white">
            The publishing platform for modern content teams.
          </p>
          <p className="text-[14px] text-white/50 mt-4 leading-relaxed">
            Manage posts, media, and your editorial calendar — all in one place.
          </p>
        </div>

      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 bg-stone-50 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo color="dark" className="h-8" />
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="font-display font-bold text-[28px] tracking-[-0.025em] text-stone-900 m-0">
              Welcome back
            </h1>
            <p className="text-[14px] text-stone-500 mt-1.5">
              Sign in to your admin account.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit} noValidate className="p-6 flex flex-col gap-4">

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[12.5px] font-medium text-stone-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@puplar.com"
                  className={`text-[14px] border rounded-lg px-3.5 py-2.5 outline-none bg-white transition
                    placeholder:text-stone-300
                    ${error ? 'border-red-300 bg-red-50/30' : 'border-stone-200 focus:border-puplar-700'}`}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[12.5px] font-medium text-stone-700">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className={`w-full text-[14px] border rounded-lg pl-3.5 pr-10 py-2.5 outline-none bg-white transition
                      placeholder:text-stone-300
                      ${error ? 'border-red-300 bg-red-50/30' : 'border-stone-200 focus:border-puplar-700'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
                    tabIndex={-1}
                  >
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 text-[14px] font-semibold text-white bg-puplar-700 hover:bg-puplar-900 rounded-lg py-2.5 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Signing in…
                  </>
                ) : 'Sign in'}
              </button>

            </form>
          </div>

        </div>
      </div>

    </div>
  );
}
