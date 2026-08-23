import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { predictionsApi } from '../services/api';
import type { Prediction } from '../types';
import { CLASS_COLORS, CLASS_LABELS } from '../types';
import GradCAMViewer from '../components/GradCAMViewer';
import ProbabilityChart from '../components/ProbabilityChart';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  Download,
  Clock,
  Cpu,
  Calendar,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export default function PredictionResult() {
  const { id } = useParams<{ id: string }>();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) loadPrediction(parseInt(id));
  }, [id]);

  const loadPrediction = async (predId: number) => {
    try {
      const data = await predictionsApi.getPrediction(predId);
      setPrediction(data);
    } catch {
      setError('Failed to load prediction details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!prediction) return;
    try {
      const blob = await predictionsApi.downloadReport(prediction.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `braintumorai_report_${prediction.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      console.error('Failed to download report');
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

  const color = CLASS_COLORS[prediction.predicted_class] || '#3b82f6';
  const label = CLASS_LABELS[prediction.predicted_class] || prediction.predicted_class;
  const confidence = (prediction.confidence * 100).toFixed(1);
  const date = new Date(prediction.created_at).toLocaleString();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <Link to="/history" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>
        <button onClick={handleDownloadReport} className="btn-secondary text-sm">
          <Download className="w-4 h-4" /> Download Report
        </button>
      </div>

      {/* Result Header Card */}
      <div className="glass-card p-8 mb-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${color}15`, border: `2px solid ${color}30` }}
            >
              <CheckCircle2 className="w-8 h-8" style={{ color }} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{label}</h1>
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
              <span className="text-4xl font-bold" style={{ color }}>{confidence}</span>
              <span className="text-lg text-slate-400 mb-1">%</span>
            </div>
            <p className="text-xs text-slate-500">Confidence Score</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Image Viewer */}
        <div className="animate-fade-in delay-100">
          <GradCAMViewer
            originalUrl={prediction.image_url}
            gradcamUrl={prediction.gradcam_url}
          />
        </div>

        {/* Right: Probabilities + Metadata */}
        <div className="space-y-6 animate-fade-in delay-200">
          <ProbabilityChart probabilities={prediction.probabilities} />

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
                  <p className="text-sm font-medium text-white truncate">{prediction.original_filename}</p>
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
