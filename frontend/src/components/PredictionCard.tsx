import { useNavigate } from 'react-router-dom';
import type { Prediction } from '../types';
import { CLASS_COLORS, CLASS_LABELS } from '../types';
import { Clock, ChevronRight } from 'lucide-react';

interface PredictionCardProps {
  prediction: Prediction;
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  const navigate = useNavigate();
  const color = CLASS_COLORS[prediction.predicted_class] || '#3b82f6';
  const label = CLASS_LABELS[prediction.predicted_class] || prediction.predicted_class;
  const confidence = (prediction.confidence * 100).toFixed(1);
  const date = new Date(prediction.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={() => navigate(`/prediction/${prediction.id}`)}
      className="glass-card glass-card-hover p-5 cursor-pointer group transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: `${color}20`,
            color: color,
            border: `1px solid ${color}30`,
          }}
        >
          {label}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" />
      </div>

      <div className="mb-3">
        <div className="flex items-end gap-1 mb-1">
          <span className="text-2xl font-bold text-white">{confidence}</span>
          <span className="text-sm text-slate-400 mb-0.5">%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${confidence}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="truncate max-w-[60%]">{prediction.original_filename}</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {date}
        </span>
      </div>
    </div>
  );
}
