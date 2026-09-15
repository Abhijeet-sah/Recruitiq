import React from 'react';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendText?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'sky' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendText,
  color = 'indigo',
}) => {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-xl', colorMap[color])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trendText) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trendText && (
            <span
              className={clsx(
                'font-medium px-1.5 py-0.5 rounded',
                trend === 'up' && 'text-emerald-700 bg-emerald-50',
                trend === 'down' && 'text-rose-700 bg-rose-50',
                trend === 'neutral' && 'text-slate-600 bg-slate-100'
              )}
            >
              {trendText}
            </span>
          )}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
