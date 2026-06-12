import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CreateCase } from './pages/cases/CreateCase';
import { CaseDetail } from './pages/cases/CaseDetail';
import { TutorDirectory } from './pages/tutors/TutorDirectory';
import { TutorProfileDetail } from './pages/tutors/TutorProfileDetail';
import { Profile } from './pages/Profile';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/cases/new" element={<ProtectedRoute><CreateCase /></ProtectedRoute>} />
        <Route path="/cases/:id" element={<ProtectedRoute><CaseDetail /></ProtectedRoute>} />
        <Route path="/tutors" element={<ProtectedRoute><TutorDirectory /></ProtectedRoute>} />
        <Route path="/tutors/:id" element={<ProtectedRoute><TutorProfileDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
