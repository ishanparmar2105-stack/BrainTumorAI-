import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import type { AdminStats } from '../types';
import { CLASS_COLORS, CLASS_LABELS } from '../types';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  BarChart3,
  Users,
  Brain,
  CalendarDays,
  Cpu,
  Activity,
  Clock,
} from 'lucide-react';

export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch {
      console.error('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24"><LoadingSpinner message="Loading admin dashboard..." /></div>;
  if (!stats) return <div className="min-h-screen pt-24 text-center text-rose-400">Failed to load dashboard.</div>;

  const pieData = stats.distribution.map((d) => ({
    name: CLASS_LABELS[d.class_name] || d.class_name,
    value: d.count,
    color: CLASS_COLORS[d.class_name] || '#3b82f6',
  }));

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">System overview and prediction analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
        <StatCard
          icon={<BarChart3 className="w-6 h-6 text-blue-400" />}
          value={stats.stats.total_predictions}
          label="Total Analyses"
          color="blue"
        />
        <StatCard
          icon={<CalendarDays className="w-6 h-6 text-cyan-400" />}
          value={stats.stats.predictions_today}
          label="Today's Analyses"
          color="cyan"
        />
        <StatCard
          icon={<Users className="w-6 h-6 text-emerald-400" />}
          value={stats.stats.total_users}
          label="Total Users"
          color="emerald"
        />
        <StatCard
          icon={<Cpu className="w-6 h-6 text-purple-400" />}
          value={`v${stats.stats.model_version}`}
          label="Model Version"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Prediction Distribution */}
        <div className="glass-card p-6 animate-fade-in delay-100">
          <h3 className="text-sm font-semibold text-slate-300 mb-6 uppercase tracking-wider">
            Prediction Distribution
          </h3>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.75rem',
                        color: '#fff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 flex-1">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-300 flex-1">{item.name}</span>
                    <span className="text-sm font-medium text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No predictions yet.</p>
          )}
        </div>

        {/* System Health */}
        <div className="glass-card p-6 animate-fade-in delay-200">
          <h3 className="text-sm font-semibold text-slate-300 mb-6 uppercase tracking-wider">
            System Health
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-slate-300">API Status</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-slate-300">ML Model</span>
              </div>
              <span className="text-sm text-slate-400">{stats.stats.active_model}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span className="text-sm text-slate-300">Uptime</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6 animate-fade-in delay-300">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
          Recent Activity
        </h3>
        {stats.recent_predictions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs text-slate-500 font-medium py-3 px-4">ID</th>
                  <th className="text-left text-xs text-slate-500 font-medium py-3 px-4">File</th>
                  <th className="text-left text-xs text-slate-500 font-medium py-3 px-4">Prediction</th>
                  <th className="text-left text-xs text-slate-500 font-medium py-3 px-4">Confidence</th>
                  <th className="text-left text-xs text-slate-500 font-medium py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_predictions.map((p) => (
                  <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-400">#{p.id}</td>
                    <td className="py-3 px-4 text-sm text-slate-300 truncate max-w-[200px]">{p.original_filename}</td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${CLASS_COLORS[p.predicted_class]}20`,
                          color: CLASS_COLORS[p.predicted_class],
                        }}
                      >
                        {CLASS_LABELS[p.predicted_class] || p.predicted_class}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-white">
                      {(p.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-sm text-center py-8">No recent activity</p>
        )}
      </div>
    </div>
  );
}
