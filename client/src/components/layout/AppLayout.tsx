import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PenLine, Clock, GitBranch, Search, LogOut, LayoutDashboard, Lightbulb, Home, Brain } from 'lucide-react';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/forgeone', icon: Brain, label: 'System' },
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/today', icon: PenLine, label: 'Capture' },
    { to: '/timeline', icon: Clock, label: 'Timeline' },
    { to: '/threads', icon: GitBranch, label: 'Threads' },
    { to: '/recall', icon: Search, label: 'Recall' },
    { to: '/insights', icon: Lightbulb, label: 'Insights' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/today" className="text-xl font-semibold text-gray-800">
              ForgeOne
            </NavLink>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{label}</span>
                </NavLink>
              ))}
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
