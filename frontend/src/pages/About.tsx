import {
  Brain,
  Code2,
  Shield,
  AlertTriangle,
  Heart,
  ExternalLink,
  Layers,
  Database,
  Cpu,
  Globe,
  TestTube,
  Container,
} from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function About() {
  const techStack = [
    { category: 'Frontend', items: ['React 18', 'TypeScript', 'Tailwind CSS', 'Vite', 'Recharts'], icon: <Globe className="w-5 h-5" />, color: 'text-blue-400' },
    { category: 'Backend', items: ['FastAPI', 'Python', 'SQLAlchemy', 'Pydantic'], icon: <Code2 className="w-5 h-5" />, color: 'text-emerald-400' },
    { category: 'ML & AI', items: ['TensorFlow', 'EfficientNetB0', 'Grad-CAM', 'scikit-learn'], icon: <Brain className="w-5 h-5" />, color: 'text-purple-400' },
    { category: 'Database', items: ['SQLite', 'Alembic Migrations'], icon: <Database className="w-5 h-5" />, color: 'text-cyan-400' },
    { category: 'Testing', items: ['Pytest', 'httpx', 'pytest-asyncio'], icon: <TestTube className="w-5 h-5" />, color: 'text-amber-400' },
    { category: 'DevOps', items: ['Docker', 'GitHub Actions'], icon: <Container className="w-5 h-5" />, color: 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/25">
          <Brain className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">About BrainTumorAI</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          An end-to-end AI-powered brain tumor MRI classification system built as an
          educational research prototype demonstrating the complete ML product lifecycle.
        </p>
      </div>

      {/* Project Description */}
      <div className="glass-card p-8 mb-8 animate-slide-up">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          What is BrainTumorAI?
        </h2>
        <div className="space-y-4 text-slate-400 leading-relaxed">
          <p>
            BrainTumorAI is a comprehensive web application that classifies brain MRI scans
            into four categories: <strong className="text-rose-400">Glioma</strong>,{' '}
            <strong className="text-amber-400">Meningioma</strong>,{' '}
            <strong className="text-blue-400">Pituitary Tumor</strong>, and{' '}
            <strong className="text-emerald-400">No Tumor</strong>.
          </p>
          <p>
            The system uses EfficientNetB0, a state-of-the-art convolutional neural network
            with transfer learning from ImageNet, to provide accurate and interpretable
            classifications. Grad-CAM (Gradient-weighted Class Activation Mapping) provides
            visual explanations of the model's decision-making process.
          </p>
          <p>
            This project demonstrates a full-stack ML pipeline including data preprocessing,
            model training, inference serving, explainable AI, user authentication, prediction
            history management, and comprehensive reporting.
          </p>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="mb-8 animate-fade-in delay-100">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          Technology Stack
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStack.map((tech) => (
            <div key={tech.category} className="glass-card glass-card-hover p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className={tech.color}>{tech.icon}</span>
                <h3 className="font-semibold text-white">{tech.category}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {tech.items.map((item) => (
                  <span key={item} className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-slate-400 border border-white/5">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations */}
      <div className="glass-card p-8 mb-8 border-amber-500/10 animate-fade-in delay-200">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Limitations
        </h2>
        <ul className="space-y-3 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            This is an educational/research prototype and is NOT intended for clinical use or medical diagnosis.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            Model predictions are based on limited training data and may not generalize to all MRI acquisition protocols.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            Grad-CAM visualizations show model attention areas, not clinically validated tumor boundaries.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            Model confidence is a statistical measure and is not equivalent to clinical certainty.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            The system has not undergone clinical validation or regulatory approval.
          </li>
        </ul>
      </div>

      {/* Ethics */}
      <div className="glass-card p-8 mb-8 animate-fade-in delay-300">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-400" />
          Ethical Considerations
        </h2>
        <div className="space-y-3 text-sm text-slate-400">
          <p>
            AI in medical imaging requires responsible development and transparent communication
            of capabilities and limitations. This project:
          </p>
          <ul className="space-y-2 ml-4">
            <li>• Never fabricates accuracy metrics or model performance claims</li>
            <li>• Clearly positions itself as a research tool, not a diagnostic device</li>
            <li>• Provides transparency through explainable AI (Grad-CAM)</li>
            <li>• Includes prominent disclaimers on all prediction results</li>
            <li>• Does not store or process actual patient data</li>
          </ul>
        </div>
      </div>

      {/* Dataset Info */}
      <div className="glass-card p-8 mb-8 animate-fade-in delay-300">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Dataset
        </h2>
        <p className="text-sm text-slate-400 mb-3">
          This project uses the Brain Tumor MRI Dataset from Kaggle, containing approximately
          7,000 brain MRI images across four classes.
        </p>
        <a
          href="https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View Dataset on Kaggle <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Disclaimer */}
      <div className="animate-fade-in delay-400">
        <MedicalDisclaimer />
      </div>
    </div>
  );
}
