import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import PredictionResult from './pages/PredictionResult';
import History from './pages/History';
import Admin from './pages/Admin';
import About from './pages/About';
import PancreaticAnalyze from './pages/PancreaticAnalyze';
import PancreaticResult from './pages/PancreaticResult';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#0a0e27] medical-grid">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analyze"
              element={
                <ProtectedRoute>
                  <Analyze />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prediction/:id"
              element={
                <ProtectedRoute>
                  <PredictionResult />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pancreatic/analyze"
              element={
                <ProtectedRoute>
                  <PancreaticAnalyze />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pancreatic/result/:id"
              element={
                <ProtectedRoute>
                  <PancreaticResult />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
