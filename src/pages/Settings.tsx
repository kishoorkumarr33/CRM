import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Database,
  RefreshCw,
  CheckCircle2,
  Server,
  Key,
  HelpCircle,
  FileText,
  AlertTriangle,
  Palette,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCRM } from '../context/CRMContext';
import { useTheme, ThemePreset } from '../context/ThemeContext';
import { testConnection } from '../config/firebase';
import { Badge } from '../components/common/Badge';

export const Settings: React.FC = () => {
  const { userProfile, updateCurrentProfile, role, isAdmin } = useAuth();
  const { handleResetDemoData, handleClearAllData, customers, leads, deals, tasks } = useCRM();
  const { currentPreset, presets, setPreset } = useTheme();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [department, setDepartment] = useState(userProfile?.department || '');
  const [jobTitle, setJobTitle] = useState(userProfile?.jobTitle || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Health check state
  const [testingHealth, setTestingHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateCurrentProfile({
        displayName,
        phone,
        department,
        jobTitle,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestDatabase = async () => {
    setTestingHealth(true);
    setHealthStatus('Verifying Firestore handshake...');
    try {
      const res = await testConnection();
      setHealthStatus(`OK: ${res.message}`);
    } catch (err) {
      setHealthStatus('Error during test connection');
    } finally {
      setTestingHealth(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-slate-100">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
          System Settings &amp; Profile
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure zero-white color theme, personal credentials, database storage, and integration health.
        </p>
      </div>

      {/* Suggested Themes & Color Customizer */}
      <div className="card-3d p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[var(--border-subtle)]">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Zero-White Theme &amp; Color Palettes
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40">
                Enforced
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Select from our 4 curated zero-white themes with rich dark tones and glowing accents
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {presets.map((preset) => {
            const isSelected = preset.id === currentPreset;
            return (
              <div
                key={preset.id}
                onClick={() => setPreset(preset.id as ThemePreset)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-[var(--bg-elevated)] border-amber-500 ring-2 ring-amber-500/30 shadow-xl'
                    : 'bg-[var(--bg-app)]/70 hover:bg-[var(--bg-app)] border-[var(--border-subtle)] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-black/40"
                      style={{ backgroundColor: preset.accentColor }}
                    />
                    {preset.name}
                  </span>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/50">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                  {preset.description}
                </p>

                {/* Swatches preview */}
                <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-black/40 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-mono mr-1">Palette:</span>
                  {preset.swatches.map((color, idx) => (
                    <span
                      key={idx}
                      className="w-4 h-4 rounded-md border border-slate-700 shadow-xs"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Profile Form */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">User Profile</h3>
              <p className="text-xs text-slate-400">Personal contact and company assignment</p>
            </div>
          </div>
          <Badge variant={role === 'admin' ? 'purple' : 'primary'} size="sm">
            {role.toUpperCase()}
          </Badge>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-slate-100 focus:outline-hidden focus:border-[var(--accent-color)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="text"
                disabled
                value={userProfile?.email || 'user@company.com'}
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-slate-100 focus:outline-hidden focus:border-[var(--accent-color)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Enterprise Sales & Operations"
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-slate-100 focus:outline-hidden focus:border-[var(--accent-color)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Sales Director"
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-slate-100 focus:outline-hidden focus:border-[var(--accent-color)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Account Status
              </label>
              <div className="flex items-center gap-2 pt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-300">Active Licensed User</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Profile changes stored successfully!
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={isSaving}
              className="btn-3d-amber px-5 py-2 text-xs font-bold"
            >
              {isSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Cloud Firestore & System Health */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[var(--border-subtle)]">
          <Database className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100">Cloud Database &amp; Storage</h3>
            <p className="text-xs text-slate-400">Firebase Firestore Enterprise connection &amp; rules</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Firestore Database</span>
              <span className="font-mono font-bold text-slate-200 text-[11px] block mt-0.5 truncate">
                ai-studio-apexcrmcustomers-35de2445-3f8e-47c8-9e46-9a00226b99ba
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">GCP Project ID</span>
              <span className="font-mono font-bold text-slate-200 text-[11px] block mt-0.5">
                radiant-union-n8f9p
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <span className="text-xs font-bold text-slate-200 block">
                Database Handshake Test
              </span>
              <span className="text-[11px] text-slate-400 block">
                Runs `getDocFromServer` validation per Firebase Integration skill.
              </span>
              {healthStatus && (
                <span className="text-xs text-amber-400 font-semibold block mt-1">
                  {healthStatus}
                </span>
              )}
            </div>
            <button
              onClick={handleTestDatabase}
              disabled={testingHealth}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--border-subtle)] text-slate-200 hover:bg-slate-800 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingHealth ? 'animate-spin' : ''}`} />
              Test Connection
            </button>
          </div>
        </div>
      </div>

      {/* Database Maintenance & Clean Slate Management */}
      <div className="card-3d p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[var(--border-subtle)]">
          <Server className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              Database Maintenance &amp; Data Control
            </h3>
            <p className="text-xs text-slate-400">
              Manage clean slate mode, wipe default data, or load demonstration records in ₹ INR
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            By default, ApexCRM runs in clean-slate mode with zero dummy records so you can build your authentic pipeline from scratch in Indian Rupees (₹). You can purge all data or load baseline records for demonstration.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleClearAllData}
              className="btn-3d-danger px-4 py-2 text-xs flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Wipe All Data (Clean Slate)
            </button>

            <button
              onClick={handleResetDemoData}
              className="btn-3d-secondary px-4 py-2 text-xs flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Baseline
            </button>
          </div>

          <div className="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Live records in system:</span>
            <span className="font-bold text-slate-200">
              {customers.length} Customers · {leads.length} Leads · {deals.length} Deals · {tasks.length} Tasks
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
