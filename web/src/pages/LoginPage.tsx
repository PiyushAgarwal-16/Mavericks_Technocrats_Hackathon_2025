import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.message ||
        `${isRegister ? 'Registration' : 'Login'} failed`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0"></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <Shield className="relative text-white w-8 h-8" />
            </div>
            <span className="text-2xl font-heading font-bold tracking-wide text-white">ZeroTrace</span>
          </Link>
          <h1 className="text-3xl font-heading font-bold mb-2">
            {isRegister ? 'Join the Protocol' : 'Welcome Back'}
          </h1>
          <p className="text-gray-400">
            {isRegister
              ? 'Create your secure identity'
              : 'Authenticate to access your dashboard'}
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Shield className="text-red-400 w-5 h-5 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all outline-none placeholder:text-gray-600"
                  placeholder="agent@zerotrace.com"
                  disabled={loading}
                />
                <Mail className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all outline-none placeholder:text-gray-600"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <Lock className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl btn-glow text-white font-bold flex items-center justify-center gap-2 group"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading
                ? (isRegister ? 'Encrypting...' : 'Authenticating...')
                : (isRegister ? 'Initialize Account' : 'Access System')}
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-gray-400 hover:text-cyan text-sm transition-colors"
            >
              {isRegister
                ? 'Already verified? Sign in'
                : "Need clearance? Create account"}
            </button>
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
