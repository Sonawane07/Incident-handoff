import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Brand Identity */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield_with_heart
              </span>
            </div>
          </div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            Incident Handoff
          </h1>
          <p className="font-label text-sm uppercase tracking-[0.15em] text-on-surface-variant mt-1 opacity-80">
            The Serene Sentinel
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-lg shadow-[0px_12px_32px_rgba(85,67,54,0.08)] p-8 md:p-10">
          <header className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Welcome back</h2>
            <p className="text-on-surface-variant text-sm mt-2">
              Manage your system's heartbeat with clarity.
            </p>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">
                  mail
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg transition-all text-on-surface placeholder:text-outline/60"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Password
                </label>
                <a className="text-xs font-medium text-primary hover:text-primary-container transition-colors" href="#">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">
                  lock
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg transition-all text-on-surface placeholder:text-outline/60"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient text-on-primary font-bold py-3.5 rounded-lg shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 pt-8 border-t border-outline-variant/20">
            <p className="text-center text-sm text-on-surface-variant">
              New to the sanctuary?
              <Link
                to="/signup"
                className="text-primary font-semibold hover:underline decoration-2 underline-offset-4 ml-1"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-on-surface-variant/60 font-medium">
          <div className="flex justify-center gap-6 mb-4">
            <a className="hover:text-on-surface transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-on-surface transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-on-surface transition-colors" href="#">Status</a>
          </div>
          <p>© 2024 Incident Handoff. All systems operational.</p>
        </footer>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-tertiary/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
};
