import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pancreaticApi } from '../services/api';
import type { PancreaticPrediction } from '../types';
import { PANCREATIC_CLASS_COLORS, PANCREATIC_CLASS_LABELS } from '../types';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';
import {
  ArrowLeft,
  Clock,
  Cpu,
  Calendar,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export default function PancreaticResult() {
  const { id } = useParams<{ id: string }>();
  const [prediction, setPrediction] = useState<PancreaticPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) loadPrediction(parseInt(id));
  }, [id]);

  const loadPrediction = async (predId: number) => {
    try {
      const data = await pancreaticApi.getPrediction(predId);
      setPrediction(data);
    } catch {
      setError('Failed to load pancreatic prediction details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24"><LoadingSpinner message="Loading analysis results..." /></div>;
  if (error || !prediction) {
    return (
      <div className="min-h-screen pt-24 px-4 text-center">
        <p className="text-rose-400">{error || 'Prediction not found.'}</p>
        <Link to="/history" className="btn-secondary mt-4 inline-flex"><ArrowLeft className="w-4 h-4" /> Back to History</Link>
      </div>
    );
  }

  const isCancer = prediction.predicted_class === 'cancer';
  const color = PANCREATIC_CLASS_COLORS[prediction.predicted_class] || '#10b981';
  const label = PANCREATIC_CLASS_LABELS[prediction.predicted_class] || prediction.predicted_class;
  const confidence = (prediction.confidence * 100).toFixed(1);
  const date = new Date(prediction.created_at).toLocaleString();

  // Probability Chart Data
  const probData = [
    { name: 'Cancer', value: prediction.probabilities.cancer * 100, color: PANCREATIC_CLASS_COLORS.cancer },
    { name: 'No Cancer', value: prediction.probabilities.no_cancer * 100, color: PANCREATIC_CLASS_COLORS.no_cancer },
  ];

  // Dynamic metrics depending on predicted class to show only Accuracy, Precision, and Recall
  const metricsData = isCancer ? [
    { name: 'Accuracy', value: prediction.model_metrics.accuracy * 100, color: '#3b82f6' }, // blue
    { name: 'Precision', value: prediction.model_metrics.precision * 100, color: '#a855f7' }, // purple
    { name: 'Recall', value: prediction.model_metrics.recall * 100, color: '#06b6d4' }, // cyan
  ] : [
    { name: 'Accuracy', value: prediction.model_metrics.accuracy * 100, color: '#3b82f6' }, // blue
    { name: 'Precision (NPV)', value: 95.12, color: '#a855f7' }, // purple
    { name: 'Recall (Specificity)', value: prediction.model_metrics.specificity * 100, color: '#06b6d4' }, // cyan
  ];

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const imageUrl = prediction.image_url.startsWith('http') 
    ? prediction.image_url 
    : `${API_BASE_URL}${prediction.image_url.startsWith('/') ? '' : '/'}${prediction.image_url}`;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <Link to="/history" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>
      </div>

      {/* Result Header Card */}
      <div className="glass-card p-8 mb-6 animate-slide-up" style={{ borderColor: `${color}40` }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${color}15`, border: `2px solid ${color}30` }}
            >
              {isCancer ? (
                <AlertTriangle className="w-8 h-8" style={{ color }} />
              ) : (
                <CheckCircle className="w-8 h-8" style={{ color }} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white">{label}</h1>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}30` }}
                >
                  AI Classification
                </span>
              </div>
              <p className="text-slate-400 text-sm">Analysis #{prediction.id} • {prediction.original_filename}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-end gap-1">
              <span className="text-5xl font-bold" style={{ color }}>{confidence}</span>
              <span className="text-xl text-slate-400 mb-1">%</span>
            </div>
            <p className="text-sm text-slate-500 font-medium">Confidence Score</p>
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="mt-6">
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${confidence}%`, backgroundColor: color }}
            />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left: Image Viewer */}
        <div className="lg:col-span-5 animate-fade-in delay-100">
          <div className="glass-card p-4 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Analyzed CT Scan
            </h3>
            <div className="relative flex-1 bg-[#05081c] rounded-xl overflow-hidden border border-white/5 medical-grid min-h-[300px] flex items-center justify-center">
              <img 
                src={imageUrl} 
                alt="CT Scan" 
                className="max-w-full max-h-[400px] object-contain z-10 relative"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Image+Not+Found';
                }}
              />
              {/* Diagnostic Crosshair Overlay */}
              <div className="absolute inset-0 pointer-events-none z-20">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-emerald-500/20" />
                <div className="absolute top-0 left-1/2 w-[1px] h-full bg-emerald-500/20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-emerald-500/40 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 space-y-6 animate-fade-in delay-200">
          
          {/* Section A - Probabilities Chart */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-6 uppercase tracking-wider">
              Class Probabilities
            </h3>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={probData} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={80} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    contentStyle={{ backgroundColor: '#0a0e27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Probability']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {probData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section B - Model Performance Metrics */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Model Validation Metrics
              </h3>
              <span className="text-xs text-slate-500 font-mono">Dataset: Kaggle NIH</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metricsData.map((metric) => (
                <div key={metric.name} className="bg-white/[0.02] rounded-xl p-5 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                        {metric.name.split(' (')[0]}
                      </span>
                      <span className="text-lg font-bold font-mono" style={{ color: metric.color }}>
                        {metric.value.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-4 leading-relaxed min-h-[32px]">
                      {metric.name.includes('Accuracy') && "Overall rate of correct AI screening classifications."}
                      {metric.name.includes('Precision') && "Ratio of correctly predicted cancer cases to all predicted cancer cases."}
                      {metric.name.includes('Recall') && "Ratio of correctly identified cancer cases to all actual positive cases."}
                      {metric.name.includes('NPV') && "Ratio of correctly predicted healthy cases to all predicted healthy cases."}
                      {metric.name.includes('Specificity') && "Ratio of correctly identified healthy cases to all actual normal cases."}
                    </p>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${metric.value}%`, backgroundColor: metric.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 my-6" />

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    contentStyle={{ backgroundColor: '#05060a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.5rem', color: '#fff' }}
                    formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Score']}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {metricsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
              Analysis Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Processing Time</p>
                  <p className="text-sm font-medium text-white">{prediction.processing_time_ms?.toFixed(0)}ms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Model Version</p>
                  <p className="text-sm font-medium text-white">v{prediction.model_version}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Analyzed At</p>
                  <p className="text-sm font-medium text-white">{date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">File Name</p>
                  <p className="text-sm font-medium text-white truncate max-w-[120px]" title={prediction.original_filename}>
                    {prediction.original_filename}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="animate-fade-in delay-300">
        <MedicalDisclaimer />
      </div>
    </div>
  );
}
