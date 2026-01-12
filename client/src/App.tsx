import { Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ForgeOneDashboard } from './pages/ForgeOneDashboard';
import { NotionDashboard } from './pages/NotionDashboard';
import { Today } from './pages/Today';
import { TimelinePage } from './pages/TimelinePage';
import { ThreadsPage } from './pages/ThreadsPage';
import { ThreadDetailPage } from './pages/ThreadDetailPage';
import { RecallPage } from './pages/RecallPage';
import { InsightsPage } from './pages/InsightsPage';
import { AppLayout } from './components/layout/AppLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
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
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgeone" element={<ForgeOneDashboard />} />
        <Route path="/home" element={<NotionDashboard />} />
        <Route path="/today" element={<Today />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/threads" element={<ThreadsPage />} />
        <Route path="/threads/:id" element={<ThreadDetailPage />} />
        <Route path="/recall" element={<RecallPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
