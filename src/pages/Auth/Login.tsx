import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  AlertCircle,
  Sparkles,
  Palette,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types/crm';

interface LoginProps {
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onNavigateRegister,
  onNavigateForgotPassword,
  onSuccess,
}) => {
  const { loginWithGoogle, loginWithEmail, switchDemoRole } = useAuth();
  const { currentPreset, presets, setPreset, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activePresetObj = presets.find((p) => p.id === currentPreset) || presets[0];

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Google Sign-In was cancelled or failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
      onSuccess();
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        setError(
          'Email/Password sign-in provider is disabled in Firebase console. Please use Google One-Click Login or Quick Role Access below.'
        );
      } else if (
        err?.code === 'auth/user-not-found' ||
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/invalid-credential'
      ) {
        setError('Invalid email or password. Please verify credentials or use Quick Role Access.');
      } else {
        setError(err?.message || 'Sign in failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoAccess = (role: UserRole) => {
    switchDemoRole(role);
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Top Header Bar with Theme Switcher & Direct App Access */}
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

        <div className="flex items-center gap-3">
          {/* Zero-White Theme Preset Switcher */}
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

          {/* Quick return to dashboard */}
          <button
            onClick={onSuccess}
            className="btn-3d-amber px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 rounded-xl transition-all"
            type="button"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Enter App</span>
          </button>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md my-auto">
        <div className="card-3d bg-[var(--bg-card)] p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-5">
          {/* Top Tabs: Login / Sign Up */}
          <div className="flex p-1 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)]">
            <button
              type="button"
              className="flex-1 py-2 rounded-lg text-xs font-black transition-all bg-[var(--bg-elevated)] text-[var(--accent-color)] shadow-sm border border-[var(--border-strong)]"
            >
              Sign In (Login)
            </button>
            <button
              type="button"
              onClick={onNavigateRegister}
              className="flex-1 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 transition-all"
            >
              Sign Up (Register)
            </button>
          </div>

          <div className="text-center pt-1">
            <h2 className="text-xl font-black text-slate-100 tracking-tight">
              Welcome back to Apex<span className="text-[var(--accent-color)]">CRM</span>
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Zero-white executive dark interface • Realtime pipeline &amp; ₹ INR currency
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Action: Google Single Sign-On */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full btn-3d-secondary py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-3 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In with Google</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-subtle)]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
              <span className="bg-[var(--bg-card)] px-2 text-slate-400 font-bold">
                Or with Email Credentials
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Corporate Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="input-3d w-full text-xs pl-9 pr-3 py-2 text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)]"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onNavigateForgotPassword}
                  className="text-[11px] text-[var(--accent-color)] hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-3d w-full text-xs pl-9 pr-3 py-2 text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-3d-amber py-2.5 px-4 text-xs font-black shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Account'}
            </button>
          </form>

          {/* Quick Demo Credentials Box for Examiners & Reviewers */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <span className="text-[11px] font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Instant Role Testing / Academic Access
            </span>
            <p className="text-[10px] text-slate-400 mb-2 leading-tight">
              Click any role to test system privileges with zero white theme:
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoAccess('admin')}
                className="btn-3d-amber py-1.5 px-2 text-[10px] font-bold rounded-lg"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoAccess('manager')}
                className="btn-3d-secondary py-1.5 px-2 text-[10px] font-bold rounded-lg"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoAccess('employee')}
                className="btn-3d-secondary py-1.5 px-2 text-[10px] font-bold rounded-lg"
              >
                Employee
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 pt-1">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={onNavigateRegister}
              className="font-bold text-[var(--accent-color)] hover:underline inline-flex items-center gap-0.5 ml-1"
            >
              Create Account
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center text-[11px] text-slate-400">
        ApexCRM Enterprise • Zero White Dark Design • Indian Rupees (₹)
      </div>
    </div>
  );
};
