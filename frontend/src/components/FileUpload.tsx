import { useCallback, useState } from 'react';
import { Upload, Image, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  accept?: string;
  maxSizeMB?: number;
}

export default function FileUpload({
  onFileSelect,
  isUploading = false,
  accept = '.jpg,.jpeg,.png',
  maxSizeMB = 10,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a JPG or PNG image.');
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return false;
    }
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      onFileSelect(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setPreview(null);
    setFileName(null);
    setError(null);
  };

  return (
    <div className="w-full">
      {!preview ? (
        <label
          className={`relative flex flex-col items-center justify-center w-full h-72 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
            dragActive
              ? 'border-blue-400 bg-blue-500/10 scale-[1.02]'
              : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
          } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
            disabled={isUploading}
          />
          <div className={`flex flex-col items-center gap-4 transition-all duration-300 ${dragActive ? 'scale-110' : ''}`}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <Upload className={`w-8 h-8 ${dragActive ? 'text-blue-400' : 'text-slate-400'}`} />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-slate-200">
                {dragActive ? 'Drop your MRI scan here' : 'Drag and drop your MRI scan'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                or <span className="text-blue-400 hover:text-blue-300 font-medium">browse files</span>
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Image className="w-3 h-3" /> JPG, PNG
              </span>
              <span>Max {maxSizeMB}MB</span>
            </div>
          </div>
        </label>
      ) : (
        <div className="glass-card p-4">
          <div className="flex items-start gap-4">
            <div className="relative w-40 h-40 rounded-xl overflow-hidden bg-black/30 flex-shrink-0">
              <img src={preview} alt="MRI Preview" className="w-full h-full object-cover" />
              {isUploading && <div className="scanner-laser" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Image selected</span>
              </div>
              <p className="text-sm text-slate-300 truncate">{fileName}</p>
              <p className="text-xs text-slate-500 mt-1">Ready for analysis</p>
              {!isUploading && (
                <button
                  onClick={clearFile}
                  className="mt-3 flex items-center gap-1.5 text-sm text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
