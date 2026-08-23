import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictionsApi } from '../services/api';
import FileUpload from '../components/FileUpload';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { Brain, Scan, AlertCircle } from 'lucide-react';

export default function Analyze() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!file) return;
    setError('');
    setLoading(true);
    try {
      const prediction = await predictionsApi.uploadAndPredict(file);
      navigate(`/prediction/${prediction.id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
          <Scan className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Analyze MRI Scan</h1>
        <p className="text-slate-400">
          Upload a brain MRI image for AI-powered classification analysis
        </p>
      </div>

      <div className="space-y-6 animate-slide-up">
        <FileUpload onFileSelect={setFile} isUploading={loading} />

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="btn-primary w-full justify-center py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 animate-spin-slow" />
              <span>Analyzing MRI Scan...</span>
            </div>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              Analyze with AI
            </>
          )}
        </button>

        {loading && (
          <div className="glass-card p-6 text-center animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-100" />
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-200" />
            </div>
            <p className="text-sm text-slate-400">
              Processing through EfficientNet model and generating Grad-CAM visualization...
            </p>
          </div>
        )}

        <MedicalDisclaimer />
      </div>
    </div>
  );
}
