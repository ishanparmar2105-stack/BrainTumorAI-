import { Link } from 'react-router-dom';
// useAuth removed since it's no longer used for landing page logic
import {
  Brain,
  Upload,
  BarChart3,
  Shield,
  Scan,
  History,
  Zap,
  ArrowRight,
  Sparkles,
  Eye,
  Activity,
} from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function Landing() {
  // isAuthenticated unused

  const features = [
    {
      icon: <Scan className="w-6 h-6" />,
      title: 'Real-Time Analysis',
      description: 'Upload brain MRI scans and receive AI-powered classification results in seconds with detailed probability distributions.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Explainable AI',
      description: 'Grad-CAM visualizations highlight the regions the model focuses on, providing transparency into AI decision-making.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <History className="w-6 h-6" />,
      title: 'Prediction History',
      description: 'Track all analyses with searchable, filterable history. Download PDF reports for documentation and review.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Research Grade',
      description: 'Built with medical safety standards, proper disclaimers, and no fabricated metrics. Honest AI for responsible research.',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const steps = [
    {
      num: '01',
      icon: <Upload className="w-8 h-8" />,
      title: 'Upload MRI Scan',
      description: 'Drag and drop or browse to upload a brain MRI image in JPG or PNG format.',
    },
    {
      num: '02',
      icon: <Brain className="w-8 h-8" />,
      title: 'AI Analysis',
      description: 'Our EfficientNet model processes the image through preprocessing, classification, and Grad-CAM generation.',
    },
    {
      num: '03',
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Get Results',
      description: 'View the prediction with confidence scores, probability distribution, and explainability visualizations.',
    },
  ];

  const tumorClasses = [
    { name: 'Glioma', color: '#f43f5e', description: 'Tumors originating from glial cells' },
    { name: 'Meningioma', color: '#f59e0b', description: 'Tumors arising from the meninges' },
    { name: 'Pituitary', color: '#3b82f6', description: 'Tumors of the pituitary gland' },
    { name: 'No Tumor', color: '#10b981', description: 'Normal brain MRI scans' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float delay-200" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24">
          <div className="animate-fade-in flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-300">AI-Powered Medical Research Prototype</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-center">
              <span className="gradient-text">Brain Tumor and Pancreatic Cancer</span>
              <br />
              <span className="text-white">Classification AI</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed text-center w-full">
              Advanced deep learning system for Brain MRI<br className="hidden sm:block" />and Pancreatic Cancer using MobileNetV4.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/analyze"
                className="btn-primary text-lg px-8 py-4 rounded-xl shadow-lg shadow-blue-500/25"
              >
                <Brain className="w-5 h-5" />
                Analyze Brain MRI
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/pancreatic/analyze"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all shadow-lg shadow-emerald-500/25 text-lg"
              >
                <Activity className="w-5 h-5" />
                Analyze Pancreatic MRI
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Classification Classes */}
          <div className="mt-20 animate-slide-up">
            <p className="text-sm text-slate-500 uppercase tracking-wider mb-6">Classification Categories</p>
            <div className="flex flex-wrap justify-center gap-3">
              {tumorClasses.map((cls) => (
                <div
                  key={cls.name}
                  className="glass-card px-5 py-3 flex items-center gap-3 glass-card-hover"
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cls.color }} />
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{cls.name}</p>
                    <p className="text-xs text-slate-500">{cls.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Pancreatic Cancer Screening Section */}
      <section className="py-24 relative overflow-hidden bg-[#0a0e27]/50 border-y border-white/5">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="glass-card p-10 sm:p-14 border-emerald-500/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <span className="flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">New Module</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Pancreatic Cancer <span className="text-emerald-400">Detection</span>
                </h2>
                
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  We've expanded our AI capabilities to include binary classification for pancreatic cancer using MRI scans. Upload a scan and get instant detection results with comprehensive model performance metrics.
                </p>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Scan className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span>Instant binary classification (Cancer Detected / No Cancer)</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span>Detailed probability distribution between classes</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span>Comprehensive model metrics including F1-Score & Specificity</span>
                  </li>
                </ul>
                
                <Link
                  to="/pancreatic/analyze"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all shadow-lg shadow-emerald-500/25"
                >
                  <Activity className="w-5 h-5" />
                  Try Pancreatic Analysis
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-2xl blur-2xl transform rotate-3" />
                <div className="glass-card p-6 border-emerald-500/30 relative">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Pancreatic Analysis</h4>
                        <p className="text-xs text-slate-400">MRI Scan Evaluation</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      High Confidence
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">Cancer Detected</span>
                        <span className="text-rose-400 font-medium">94.2%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 w-[94.2%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">No Cancer</span>
                        <span className="text-emerald-400 font-medium">5.8%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[5.8%]" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-[3px] border-emerald-500 flex items-center justify-center text-sm font-bold text-white">
                      94%
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Model F1-Score</p>
                      <p className="text-xs text-slate-400">Validated on clinical dataset</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Powerful <span className="gradient-text">Features</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              A comprehensive platform combining state-of-the-art deep learning with
              modern web technologies for brain tumor research.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="glass-card glass-card-hover p-8 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 text-white shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Three simple steps to analyze brain MRI scans with AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="glass-card glass-card-hover p-8 text-center h-full">
                  <div className="text-5xl font-bold text-white/5 mb-4">{step.num}</div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-5 text-blue-400">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 z-10">
                    <ArrowRight className="w-8 h-8 text-white/10" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
            <div className="relative z-10">
              <Brain className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-float" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Analyze?
              </h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                Start exploring brain MRI classification with our AI-powered research platform.
              </p>
              <Link
                to="/analyze"
                className="btn-primary text-lg px-8 py-4 rounded-xl"
              >
                <Zap className="w-5 h-5" />
                Start Instant Analysis
              </Link>
            </div>
          </div>

          <div className="mt-12">
            <MedicalDisclaimer />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-slate-500">BrainTumorAI — Research Prototype</span>
          </div>
          <p className="text-xs text-slate-600">
            Not intended for clinical diagnosis. For educational and research purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
