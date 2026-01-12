import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Plus, Target } from 'lucide-react';

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  // Don't show navigation for ModernForgeOne page (it has its own)
  const isModernForgeOne = location.pathname === '/app' || location.pathname === '/forgeone' || location.pathname === '/';

  if (isModernForgeOne) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/app" className="text-xl font-bold text-gray-900">
              ForgeOne
            </a>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              <a
                href="/app"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              >
                <Target size={18} />
                <span>Home</span>
              </a>
              <a
                href="/capture"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              >
                <Plus size={18} />
                <span>Capture</span>
              </a>
            </nav>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:inline">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
