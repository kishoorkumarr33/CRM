import React from 'react';
import { LucideIcon, Inbox, Plus, Zap } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  quickAddType?: 'customer' | 'lead' | 'deal' | 'task';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  quickAddType = 'customer',
}) => {
  const { openQuickAdd, handleLoadSampleData } = useCRM();

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-inner my-4">
      {/* 3D Floating Icon Box */}
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white flex items-center justify-center shadow-[0_10px_20px_-3px_rgba(79,70,229,0.35),inset_0_1px_0_rgba(255,255,255,0.4)] transform hover:scale-105 hover:-translate-y-1 transition-all duration-300">
          <Icon className="w-8 h-8 drop-shadow" />
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-2.5 bg-slate-300/40 rounded-full blur-xs" />
      </div>

      <h3 className="text-base font-extrabold text-slate-900 mb-1 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed font-medium">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction ? (
          <button
            onClick={onAction}
            className="btn-3d-primary px-5 py-2.5 text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {actionLabel}
          </button>
        ) : (
          <button
            onClick={() => openQuickAdd(quickAddType)}
            className="btn-3d-primary px-5 py-2.5 text-xs flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            Launch Quick Add (Q)
          </button>
        )}

        <button
          onClick={handleLoadSampleData}
          className="btn-3d-secondary px-4 py-2 text-xs flex items-center gap-1.5"
          title="Populate test records for evaluation"
        >
          Load Sample Demo Data
        </button>
      </div>
    </div>
  );
};
