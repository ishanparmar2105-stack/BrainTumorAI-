import { useState } from 'react';
import { Eye, Layers, Blend, AlertTriangle } from 'lucide-react';

interface GradCAMViewerProps {
  originalUrl: string;
  gradcamUrl: string | null;
}

type ViewMode = 'original' | 'heatmap' | 'overlay';

export default function GradCAMViewer({ originalUrl, gradcamUrl }: GradCAMViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('original');
  const baseUrl = 'http://localhost:8000';

  const tabs: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'original', label: 'Original', icon: <Eye className="w-4 h-4" /> },
    { mode: 'overlay', label: 'Grad-CAM Overlay', icon: <Blend className="w-4 h-4" /> },
  ];

  const getImageUrl = () => {
    if (viewMode === 'original') return `${baseUrl}${originalUrl}`;
    if (gradcamUrl) return `${baseUrl}${gradcamUrl}`;
    return `${baseUrl}${originalUrl}`;
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.mode}
            onClick={() => setViewMode(tab.mode)}
            disabled={tab.mode !== 'original' && !gradcamUrl}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 ${
              viewMode === tab.mode
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            } ${tab.mode !== 'original' && !gradcamUrl ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-black/30 flex items-center justify-center p-4">
        <img
          src={getImageUrl()}
          alt={`MRI ${viewMode}`}
          className="max-w-full max-h-full object-contain rounded-lg transition-opacity duration-300 z-10"
        />
        {/* Diagnostic crosshair & medical grid overlay */}
        <div className="absolute inset-4 border border-white/5 pointer-events-none rounded-lg overflow-hidden z-20">
          <div className="absolute inset-0 medical-grid opacity-25" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-l border-dashed border-cyan-500/10" />
          <div className="absolute top-1/2 left-0 right-0 h-[1px] border-t border-dashed border-cyan-500/10" />
          <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-600">ROI: 224x224</div>
          <div className="absolute bottom-2 right-2 text-[8px] font-mono text-slate-600">VIEW: AXIAL</div>
        </div>
        {viewMode !== 'original' && !gradcamUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <Layers className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Grad-CAM not available</p>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      {viewMode !== 'original' && gradcamUrl && (
        <div className="px-4 py-3 bg-amber-500/5 border-t border-amber-500/10 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400/80">
            Highlighted regions represent model attention areas and should not be interpreted as
            clinically validated tumor boundaries.
          </p>
        </div>
      )}
    </div>
  );
}
