import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { predictionsApi } from '../services/api';
import type { Prediction } from '../types';
import PredictionCard from '../components/PredictionCard';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Brain,
  Upload,
  History,
  BarChart3,
  TrendingUp,
  Scan,
  ArrowRight,
  Inbox,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      const response = await predictionsApi.getPredictions(1, 6);
      setPredictions(response.predictions);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to load predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const avgConfidence = predictions.length > 0
    ? (predictions.reduce((s, p) => s + p.confidence, 0) / predictions.length * 100).toFixed(0)
    : '—';

  const lastResult = predictions.length > 0
    ? predictions[0].predicted_class.charAt(0).toUpperCase() + predictions[0].predicted_class.slice(1)
    : '—';

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, <span className="gradient-text">{user?.username}</span>
        </h1>
        <p className="text-slate-400">Here's an overview of your brain MRI analyses.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
        <StatCard
          icon={<Brain className="w-6 h-6 text-blue-400" />}
          value={total}
          label="Total Analyses"
          color="blue"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}
          value={`${avgConfidence}%`}
          label="Avg Confidence"
          color="emerald"
        />
        <StatCard
          icon={<Scan className="w-6 h-6 text-cyan-400" />}
          value={lastResult}
          label="Last Result"
          color="cyan"
        />
        <StatCard
          icon={<BarChart3 className="w-6 h-6 text-purple-400" />}
          value={predictions.length > 0 ? `${predictions[0].processing_time_ms?.toFixed(0) || '—'}ms` : '—'}
          label="Last Inference Time"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/analyze" className="btn-primary">
          <Upload className="w-4 h-4" /> New Analysis
        </Link>
        <Link to="/history" className="btn-secondary">
          <History className="w-4 h-4" /> View History
        </Link>
      </div>

      {/* Recent Predictions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Analyses</h2>
          {predictions.length > 0 && (
            <Link to="/history" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your analyses..." />
        ) : predictions.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No analyses yet</h3>
            <p className="text-sm text-slate-500 mb-6">Upload your first brain MRI scan to get started.</p>
            <Link to="/analyze" className="btn-primary">
              <Upload className="w-4 h-4" /> Start Your First Analysis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map((p) => (
              <PredictionCard key={p.id} prediction={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
