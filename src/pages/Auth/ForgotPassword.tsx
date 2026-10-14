import React, { useState } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Palette,
  LayoutDashboard,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface ForgotPasswordProps {
  onNavigateLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigateLogin }) => {
  const { sendPasswordReset } = useAuth();
  const { currentPreset, presets, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activePresetObj = presets.find((p) => p.id === currentPreset) || presets[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your account email.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordReset(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Password reset request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Top Header Bar with Theme Switcher */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-700 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40">
            A
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-100">
              Apex<span className="text-[var(--accent-color)]">CRM</span>
            </span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              India Edition (₹ INR) • Zero White Theme
            </span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="btn-3d-secondary px-3.5 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-all"
          title={`Switch to next zero-white theme (Active: ${activePresetObj.name})`}
          type="button"
        >
          <Palette className="w-4 h-4 text-[var(--accent-color)]" />
          <span className="text-slate-200">{activePresetObj.name}</span>
          <span
            className="w-2.5 h-2.5 rounded-full border border-slate-700 shadow-xs"
            style={{ backgroundColor: activePresetObj.accentColor }}
          />
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md my-auto">
        <div className="card-3d bg-[var(--bg-card)] py-8 px-6 sm:px-8 rounded-3xl border border-[var(--border-subtle)] space-y-5">
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-100 tracking-tight">
              Reset Password
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Enter your registered corporate email to receive recovery instructions
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an account exists for <strong className="text-slate-200">{email}</strong>, you will receive password reset instructions.
              </p>
              <button
                type="button"
                onClick={onNavigateLogin}
                className="mt-4 btn-3d-amber px-4 py-2 text-xs font-bold"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Corporate Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.in"
                    className="input-3d w-full text-xs pl-9 pr-3 py-2 text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)]"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-3d-amber py-2.5 px-4 text-xs font-black shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Recovery Link'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-color)] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-md w-full mx-auto text-center text-[11px] text-slate-400">
        ApexCRM Enterprise • Zero White Dark Design • Indian Rupees (₹)
      </div>
    </div>
  );
};
