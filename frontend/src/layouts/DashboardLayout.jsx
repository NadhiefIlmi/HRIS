import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, Upload, LogOut } from 'lucide-react';
import ChateraiseLogo from '../assets/Chateraise2.png';
import API from '../api/api';

const NavLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-4 px-5 py-3 rounded-lg transition-colors ${isActive
          ? 'bg-[#662b1f] text-white font-semibold'
          : 'text-[#4a3b36] hover:bg-[#f5e8e0]'
        }`}
    >
      <Icon size={20} />
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
};

function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

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
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const username = localStorage.getItem('username') || 'User';
  const capitalizedName = username.charAt(0).toUpperCase() + username.slice(1);

  return (
    <div className="flex min-h-screen w-full bg-[#fefcfb]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r px-6 py-8 flex flex-col min-h-screen rounded-l-2xl shadow-xl">
        <div className="mb-10 flex justify-center">
          <img
            src={ChateraiseLogo}
            alt="Chateraise Logo"
            className="h-14 object-contain"
          />
        </div>

        <nav className="flex flex-col gap-6">
          <NavLink to="/dashboard" icon={Home} label="Dashboard" />
          <NavLink to="/employees" icon={Users} label="Employees" />
          <NavLink to="/leave-requests" icon={Calendar} label="Leave Requests" />
          <NavLink to="/upload-salary" icon={Upload} label="Upload Salary Slip" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-5 py-3 rounded-lg text-[#4a3b36] hover:bg-[#f5e8e0] transition-colors mt-auto"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white p-8 rounded-r-2xl shadow-xl">
        {/* Header */}
        <Link
          to="/profile"
          className="flex justify-end items-center mb-6 space-x-4 cursor-pointer hover:opacity-80 transition"
        >
          {profile?.photo ? (
            <img
              src={`http://localhost:5000${profile.photo}`}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover shadow-md"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#662b1f] flex items-center justify-center text-white font-semibold text-lg shadow-md">
              {capitalizedName.charAt(0)}
            </div>
          )}
          <div className="flex flex-col justify-center">
            <span className="text-[#662b1f] font-semibold text-xl">{capitalizedName}</span>
            <span className="text-sm text-gray-500">HR Manager</span>
          </div>
        </Link>
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
