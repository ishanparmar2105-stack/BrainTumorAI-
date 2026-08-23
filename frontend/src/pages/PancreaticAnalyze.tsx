import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pancreaticApi } from '../services/api';
import FileUpload from '../components/FileUpload';
import { Activity, AlertCircle, Heart } from 'lucide-react';

export default function PancreaticAnalyze() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const result = await pancreaticApi.uploadAndPredict(file);
      navigate(`/pancreatic/result/${result.id}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || 'Analysis failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Pancreatic Cancer Screening</h1>
        <p className="text-slate-400">
          Upload a pancreatic CT scan image for AI-powered cancer detection
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
          className="w-full justify-center py-4 text-lg font-semibold text-white rounded-xl cursor-pointer transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
          style={{
            background: loading
              ? 'linear-gradient(135deg, #059669, #0d9488)'
              : 'linear-gradient(135deg, #10b981, #14b8a6)',
          }}
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 animate-pulse" />
              <span>Screening CT Scan...</span>
            </div>
          ) : (
            <>
              <Activity className="w-5 h-5" />
              Screen for Pancreatic Cancer
            </>
          )}
        </button>

        {loading && (
          <div className="glass-card p-6 text-center animate-fade-in">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 animate-spin" />
              <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-white font-medium mb-1">Running AI Cancer Screening...</p>
            <p className="text-slate-500 text-sm">
              Preprocessing CT image → Running neural network inference → Computing metrics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
