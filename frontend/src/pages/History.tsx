import { useState, useEffect } from 'react';
import { predictionsApi } from '../services/api';
import type { Prediction } from '../types';
import { CLASS_LABELS } from '../types';
import PredictionCard from '../components/PredictionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Search,
  Filter,
  SortAsc,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react';

export default function HistoryPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadPredictions();
  }, [page, classFilter]);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const response = await predictionsApi.getPredictions(page, perPage, classFilter, search);
      setPredictions(response.predictions);
      setTotal(response.total);
    } catch {
      console.error('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPredictions();
  };

  const handleDelete = async (id: number) => {
    try {
      await predictionsApi.deletePrediction(id);
      setPredictions((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => prev - 1);
      setDeleteId(null);
    } catch {
      console.error('Failed to delete prediction');
    }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Prediction History</h1>
        <p className="text-slate-400">Browse and manage all your brain MRI analyses</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 pr-4"
            placeholder="Search by filename..."
          />
        </form>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select
            value={classFilter}
            onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
            className="input-field pl-10 pr-8 appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="all">All Classes</option>
            {Object.entries(CLASS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <SortAsc className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {total} {total === 1 ? 'result' : 'results'}
          {classFilter !== 'all' && ` for ${CLASS_LABELS[classFilter]}`}
        </p>
      </div>

      {/* Predictions Grid */}
      {loading ? (
        <LoadingSpinner message="Loading history..." />
      ) : predictions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No predictions found</h3>
          <p className="text-sm text-slate-500">
            {search || classFilter !== 'all' ? 'Try adjusting your filters.' : 'Start by analyzing an MRI scan.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {predictions.map((p) => (
              <div key={p.id} className="relative group">
                <PredictionCard prediction={p} />
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary py-2 px-3 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        page === pageNum
                          ? 'bg-blue-500 text-white'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary py-2 px-3 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="glass-card p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-2">Delete Prediction?</h3>
            <p className="text-sm text-slate-400 mb-6">This action cannot be undone. The prediction and associated files will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold transition-all text-center">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
