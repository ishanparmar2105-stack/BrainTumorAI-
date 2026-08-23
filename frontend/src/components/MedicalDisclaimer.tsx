import { AlertTriangle } from 'lucide-react';

export default function MedicalDisclaimer() {
  return (
    <div className="glass-card p-5 border-amber-500/20 bg-amber-500/[0.03]">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-amber-400 mb-1">Medical Disclaimer</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            This system is an <strong className="text-slate-300">educational/research prototype</strong> and
            is not intended for clinical diagnosis or treatment decisions. Results represent AI-assisted
            MRI classification and should be reviewed by a qualified medical professional. Model
            confidence is not equivalent to clinical certainty.
          </p>
        </div>
      </div>
    </div>
  );
}
