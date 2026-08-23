import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CLASS_COLORS, CLASS_LABELS } from '../types';

interface ProbabilityChartProps {
  probabilities: Record<string, number>;
}

export default function ProbabilityChart({ probabilities }: ProbabilityChartProps) {
  const data = Object.entries(probabilities)
    .map(([key, value]) => ({
      name: CLASS_LABELS[key] || key,
      probability: parseFloat((value * 100).toFixed(1)),
      key,
      color: CLASS_COLORS[key] || '#3b82f6',
    }))
    .sort((a, b) => b.probability - a.probability);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { name: string; color: string } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 text-sm">
          <p className="font-medium text-white">{payload[0].payload.name}</p>
          <p style={{ color: payload[0].payload.color }} className="font-bold text-lg">
            {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
        Probability Distribution
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 13 }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="probability" radius={[0, 6, 6, 0]} barSize={28}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
