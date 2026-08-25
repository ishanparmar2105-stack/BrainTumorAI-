import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  Upload,
  Info,
  Activity,
} from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/pancreatic/analyze') return location.pathname.startsWith('/pancreatic');
    return location.pathname === path;
  };

  const navLinkClass = (path: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
      isActive(path)
        ? 'bg-white/10 text-white'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e27]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">CancerDetectAI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated && (
              <>
                <Link to="/analyze" className={navLinkClass('/analyze')}>
                  <Upload className="w-4 h-4" />
                  Brain
                </Link>
                <Link to="/pancreatic/analyze" className={navLinkClass('/pancreatic/analyze')}>
                  <Activity className="w-4 h-4" />
                  Pancreatic
                </Link>
              </>
            )}
            <Link to="/about" className={navLinkClass('/about')}>
              <Info className="w-4 h-4" />
              About
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-300">{user?.username}</span>
                  {isAdmin && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0e27]/95 backdrop-blur-xl border-b border-white/5 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {isAuthenticated && (
              <>
                <Link to="/analyze" className={navLinkClass('/analyze')} onClick={() => setMobileOpen(false)}>
                  <Upload className="w-4 h-4" /> Brain
                </Link>
                <Link to="/pancreatic/analyze" className={navLinkClass('/pancreatic/analyze')} onClick={() => setMobileOpen(false)}>
                  <Activity className="w-4 h-4" /> Pancreatic
                </Link>
              </>
            )}
            <Link to="/about" className={navLinkClass('/about')} onClick={() => setMobileOpen(false)}>
              <Info className="w-4 h-4" /> About
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
