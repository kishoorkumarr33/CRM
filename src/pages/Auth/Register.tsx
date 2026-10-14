import React, { useState } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Palette,
  LayoutDashboard,
  Shield,
  UserCheck,
  ChevronRight,
  User,
  Mail,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types/crm';

interface RegisterProps {
  onNavigateLogin: () => void;
  onSuccess: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigateLogin, onSuccess }) => {
  const { registerWithEmail } = useAuth();
  const { currentPreset, presets, toggleTheme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activePresetObj = presets.find((p) => p.id === currentPreset) || presets[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await registerWithEmail(email, password, name, role);
      onSuccess();
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        setError('Email registration is disabled in Firebase console. Please sign in with Google or use Quick Role Access.');
      } else {
        setError(err?.message || 'Registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
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

      {/* Main Registration Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md my-auto">
        <div className="card-3d bg-[var(--bg-card)] p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-5">
          {/* Top Tabs: Login / Sign Up */}
          <div className="flex p-1 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="flex-1 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 transition-all"
            >
              Sign In (Login)
            </button>
            <button
              type="button"
              className="flex-1 py-2 rounded-lg text-xs font-black transition-all bg-[var(--bg-elevated)] text-[var(--accent-color)] shadow-sm border border-[var(--border-strong)]"
            >
              Sign Up (Register)
            </button>
          </div>

          <div className="text-center pt-1">
            <h2 className="text-xl font-black text-slate-100 tracking-tight">
              Create New CRM Account
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Join your team with zero-white executive interface and ₹ INR records
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="input-3d w-full text-xs pl-9 pr-3 py-2 text-slate-100 bg-[var(--bg-app)] border-[var(--border-subtle)]"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Corporate Email
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password (min 6 characters)
              </label>
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assigned Initial Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['employee', 'manager', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border capitalize transition-all ${
                      role === r
                        ? 'bg-[var(--accent-color)] text-slate-950 border-[var(--accent-color)] shadow-md'
                        : 'bg-[var(--bg-elevated)] text-slate-300 border-[var(--border-subtle)] hover:bg-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-3d-amber py-2.5 px-4 text-xs font-black shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-1">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="font-bold text-[var(--accent-color)] hover:underline inline-flex items-center gap-0.5 ml-1"
            >
              Sign In
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
