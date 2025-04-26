import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, LogOut, Bell, Settings, ChevronRight } from 'lucide-react';
import ChateraiseLogo from '../assets/Chateraise2.png';
import API from '../api/api';

const NavLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
          ? 'bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] text-white font-medium shadow-md'
          : 'text-gray-700 hover:bg-[#f5e8e0] hover:text-[#662b1f]'
        }`}
    >
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-sm whitespace-nowrap">{label}</span>
    </Link>
  );
};

function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [notificationCount, setNotificationCount] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch Profile from the API
  const fetchProfile = async () => {
    try {
      const response = await API.get('/api/hr/me');
      setProfile(response.data);
    } catch (err) {
      console.error('Error fetching profile for avatar:', err);
      if (err.response && err.response.status === 401) {
        localStorage.clear();
        navigate('/');
      }
    }
  };

  useEffect(() => {
    fetchProfile();

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');

      if (token) {
        await API.post('/api/hr/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      localStorage.clear();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      localStorage.clear();
      navigate('/');
    }
  };

  const username = localStorage.getItem('username') || 'User';
  const capitalizedName = username.charAt(0).toUpperCase() + username.slice(1);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex min-h-screen bg-[#f8f5f3]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-[#f0e8e4] py-8 flex flex-col min-h-screen shadow-lg">
        <div className="mb-10 px-6">
          <div className="flex items-center justify-center mb-6">
            <img
              src={ChateraiseLogo}
              alt="Chateraise Logo"
              className="h-14 object-contain"
            />
          </div>

          <div className="bg-[#fdf6f3] rounded-2xl p-4 mb-0.1 shadow-sm">
            {profile?.photo ? (
              <div className="flex items-center gap-3">
                <img
                  src={`http://localhost:5000${profile.photo}`}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div>
                  <h4 className="font-semibold text-[#662b1f]">{capitalizedName}</h4>
                  <p className="text-xs text-gray-500">HR Manager</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#662b1f] to-[#8a3b2d] flex items-center justify-center text-white font-semibold text-lg shadow-md border-2 border-white">
                  {capitalizedName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-[#662b1f]">{capitalizedName}</h4>
                  <p className="text-xs text-gray-500">HR Manager</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Menu Dipindah ke atas */}
        <nav className="flex-1 px-4 flex flex-col gap-2">
          <p className="px-4 text-xs font-medium text-gray-400 mb-1">MAIN MENU</p>
          <NavLink to="/dashboard" icon={Home} label="Dashboard" />
          <div className="flex flex-col gap-1">
            <NavLink to="/employees" icon={Users} label="Employees" />
            {/* Link to Add Employee page */}
            <Link
              to="/employees/add"
              className="ml-10 text-xs text-[#662b1f] px-3 py-2 rounded-lg hover:bg-[#f5e8e0] transition flex items-center gap-2"
            >
              <span className="w-4 h-4 bg-[#662b1f] text-white rounded-full flex items-center justify-center text-xs font-bold">+</span>
              <span>Add Employee</span>
            </Link>
          </div>

          <NavLink to="/leave-requests" icon={Calendar} label="Leave Requests" />
        </nav>

        {/* Logout Button */}
        <div className="mt-auto mb-6 px-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-red-600 to-[#662b1f] hover:shadow-md transition-all duration-200"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white p-6 flex justify-between items-center border-b border-[#f0e8e4] shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[#662b1f]">Welcome back, {capitalizedName}</h1>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#f8f5f3] transition-colors"
            >
              <span className="font-medium text-gray-800">My Profile</span>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="bg-white rounded-2xl shadow-md p-8 min-h-full">
            {/* Main children content */}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;