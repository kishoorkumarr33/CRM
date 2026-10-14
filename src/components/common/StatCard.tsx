import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
  colorScheme?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  isPositive = true,
  subtext,
  colorScheme = 'indigo',
  onClick,
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      iconShadow: 'shadow-[0_4px_12px_rgba(79,70,229,0.2),inset_0_1px_0_rgba(255,255,255,0.8)]',
      border: 'border-slate-200/90',
      pill: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      iconShadow: 'shadow-[0_4px_12px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.8)]',
      border: 'border-slate-200/90',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      iconShadow: 'shadow-[0_4px_12px_rgba(245,158,11,0.2),inset_0_1px_0_rgba(255,255,255,0.8)]',
      border: 'border-slate-200/90',
      pill: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      iconShadow: 'shadow-[0_4px_12px_rgba(244,63,94,0.2),inset_0_1px_0_rgba(255,255,255,0.8)]',
      border: 'border-slate-200/90',
      pill: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    sky: {
      bg: 'bg-sky-50 text-sky-600',
      iconShadow: 'shadow-[0_4px_12px_rgba(14,165,233,0.2),inset_0_1px_0_rgba(255,255,255,0.8)]',
      border: 'border-slate-200/90',
      pill: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      iconShadow: 'shadow-[0_4px_12px_rgba(168,85,247,0.2),inset_0_1px_0_rgba(255,255,255,0.8)]',
      border: 'border-slate-200/90',
      pill: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  };

  const theme = colorMap[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`group relative card-3d p-5.5 hover:-translate-y-1 hover:shadow-[0_16px_30px_-5px_rgba(15,23,42,0.08),0_0_0_1px_rgba(99,102,241,0.2)_inset] transition-all duration-200 cursor-pointer overflow-hidden`}
    >
      {/* Top 3D highlight edge */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-60" />

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black tracking-wider text-slate-500 uppercase">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${theme.bg} ${theme.iconShadow} border border-slate-200/70 transition-transform group-hover:scale-110`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>

      <div className="mt-3.5 flex items-baseline gap-2">
        <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
          {value}
        </h4>
        {change && (
          <span
            className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md border ${
              isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
            {change}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1.5 text-xs text-slate-500 font-medium">
          {subtext}
        </p>
      )}
    </div>
  );
};
