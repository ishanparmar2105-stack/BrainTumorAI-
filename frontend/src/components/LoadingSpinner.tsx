import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }: LoadingSpinnerProps) {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <Loader2 className={`${sizeMap[size]} animate-spin text-blue-400`} />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
