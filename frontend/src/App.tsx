import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ResumeListPage from '@/pages/ResumeListPage';
import EditorPage from '@/pages/EditorPage';
import SharedResumePage from '@/pages/SharedResumePage';
import OptimizePage from '@/pages/OptimizePage';
import InterviewPage from '@/pages/InterviewPage';
import InterviewHistoryPage from '@/pages/InterviewHistoryPage';
import InterviewHistoryDetailPage from '@/pages/InterviewHistoryDetailPage';
import './App.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/shared/:token" element={<SharedResumePage />} />
      <Route
        path="/resumes"
        element={
          <ProtectedRoute>
            <ResumeListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editor/:id?"
        element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/optimize"
        element={
          <ProtectedRoute>
            <OptimizePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <InterviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/history"
        element={
          <ProtectedRoute>
            <InterviewHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/history/:id"
        element={
          <ProtectedRoute>
            <InterviewHistoryDetailPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
