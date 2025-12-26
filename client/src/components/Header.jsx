import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user?.role || 'guest';
  const userName = user?.username || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <header className="bg-neutral-900 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-400">
                Recruitment System
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            {userRole === 'admin' && (
              <button
                onClick={() => handleNavigation('/admin')}
                className="text-neutral-300 hover:text-blue-400 font-medium transition-colors"
              >
                HR Management
              </button>
            )}
            {userRole === 'hr' && (
              <button
                onClick={() => handleNavigation('/hr')}
                className="text-neutral-300 hover:text-blue-400 font-medium transition-colors"
              >
                Dashboard
              </button>
            )}
            {userRole === 'candidate' && (
              <button
                onClick={() => handleNavigation('/my-applications')}
                className="text-neutral-300 hover:text-blue-400 font-medium transition-colors"
              >
                My Applications
              </button>
            )}
            <button
              onClick={() => handleNavigation('/jobs')}
              className="text-neutral-300 hover:text-blue-400 font-medium transition-colors"
            >
              Jobs
            </button>
          </nav>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{userName}</p>
              <p className="text-xs text-neutral-400 capitalize">{userRole}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
