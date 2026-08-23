import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  trend?: string;
  color?: 'blue' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple';
}

const colorMap = {
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
  cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20 text-cyan-400',
  emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400',
  amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400',
  rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/20 text-rose-400',
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400',
};

export default function StatCard({ icon, value, label, trend, color = 'blue' }: StatCardProps) {
  return (
    <div className={`glass-card glass-card-hover p-6 bg-gradient-to-br ${colorMap[color]} transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          <p className="text-sm text-slate-400 mt-1">{label}</p>
          {trend && (
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
