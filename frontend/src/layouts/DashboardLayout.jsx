import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  LogOut, 
  Settings, 
  ChevronRight,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChateraiseLogo from '../assets/Chateraise2.png';
import API from '../api/api';

// Animated NavLink component
const NavLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
            ? 'bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] text-white font-medium shadow-lg'
            : 'text-gray-700 hover:bg-[#f5e8e0] hover:text-[#662b1f]'
          }`}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={isActive ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
        </motion.div>
        <span className="text-sm whitespace-nowrap">{label}</span>
        {isActive && (
          <motion.div
            className="ml-auto h-2 w-2 rounded-full bg-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </Link>
    </motion.div>
  );
};

function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [notificationCount, setNotificationCount] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Profile from the API
  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await API.get('/api/hr/me');
      setProfile(response.data);
    } catch (err) {
      console.error('Error fetching profile for avatar:', err);
      if (err.response && err.response.status === 401) {
        localStorage.clear();
        navigate('/');
      }
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    // Close sidebar when screen gets larger
    const handleResize = () => {
      if (window.innerWidth > 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

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
    <div className="flex h-screen bg-[#f8f5f3] overflow-hidden">
      {/* Mobile Overlay with Animated Opacity */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            className="fixed inset-0 bg-black z-20 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Animated Sidebar */}
      <motion.aside 
        className="fixed lg:static w-72 bg-white h-full border-r border-[#f0e8e4] py-8 flex flex-col z-30 shadow-xl"
        initial={false}
        animate={{
          x: sidebarOpen || window.innerWidth > 1024 ? 0 : -288,
          boxShadow: sidebarOpen ? "10px 0 25px rgba(0,0,0,0.1)" : "none"
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30 
        }}
      >
        <div className="mb-10 px-6">
          <div className="flex items-center justify-between mb-6">
            <motion.img
              src={ChateraiseLogo}
              alt="Chateraise Logo"
              className="h-12 object-contain"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
            <motion.button 
              className="lg:hidden text-gray-500 hover:text-[#662b1f]"
              onClick={() => setSidebarOpen(false)}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.button>
          </div>

          <motion.div 
            className="bg-[#fdf6f3] rounded-2xl p-4 shadow-sm backdrop-blur-sm border border-[#f0e8e4] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ 
              boxShadow: "0 10px 15px -3px rgba(102, 43, 31, 0.1), 0 4px 6px -2px rgba(102, 43, 31, 0.05)",
              y: -2
            }}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#662b1f] to-[#8a3b2d] animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ) : profile?.photo ? (
              <div className="flex items-center gap-3">
                <motion.img
                  src={`http://localhost:5000${profile.photo}`}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.4
                  }}
                />
                <div>
                  <h4 className="font-semibold text-[#662b1f]">{capitalizedName}</h4>
                  <p className="text-xs text-gray-500">HR Manager</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-[#662b1f] to-[#8a3b2d] flex items-center justify-center text-white font-semibold text-lg shadow-md border-2 border-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.4
                  }}
                >
                  {capitalizedName.charAt(0)}
                </motion.div>
                <div>
                  <h4 className="font-semibold text-[#662b1f]">{capitalizedName}</h4>
                  <p className="text-xs text-gray-500">HR Manager</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Main Menu with Staggered Animation */}
        <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-[#f0e8e4] scrollbar-track-transparent">
          <motion.p 
            className="px-4 text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Main Menu
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <NavLink to="/dashboard" icon={Home} label="Dashboard" />
          </motion.div>
          
          <motion.div 
            className="flex flex-col gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <NavLink to="/employees" icon={Users} label="Employees" />
            {/* Link to Add Employee page with animation */}
            <motion.div
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/employees/add"
                className="ml-10 text-xs text-[#662b1f] px-3 py-2 rounded-lg hover:bg-[#f5e8e0] transition flex items-center gap-2 group"
              >
                <motion.span 
                  className="w-4 h-4 bg-[#662b1f] text-white rounded-full flex items-center justify-center text-xs font-bold"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                >
                  +
                </motion.span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">Add Employee</span>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <NavLink to="/leave-requests" icon={Calendar} label="Leave Requests" />
          </motion.div>
        </nav>

        {/* Logout Button with Hover Effect */}
        <motion.div 
          className="mt-auto mb-6 px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-red-600 to-[#662b1f] hover:shadow-md transition-all duration-200"
            whileHover={{ 
              scale: 1.03, 
              boxShadow: "0 10px 15px -3px rgba(102, 43, 31, 0.2), 0 4px 6px -2px rgba(102, 43, 31, 0.1)" 
            }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </motion.button>
        </motion.div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header with Entrance Animation */}
        <motion.header 
          className="bg-white p-6 flex justify-between items-center border-b border-[#f0e8e4] shadow-sm sticky top-0 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              className="lg:hidden text-[#662b1f] hover:bg-[#f5e8e0] p-2 rounded-lg"
              onClick={() => setSidebarOpen(true)}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <Menu size={24} />
            </motion.button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#662b1f] flex items-center gap-2">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Welcome back,
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-clip-text text-transparent bg-gradient-to-r from-[#662b1f] to-[#8a3b2d]"
                >
                  {capitalizedName}
                </motion.span>
                <motion.span 
                  className="hidden sm:inline-block ml-2 px-3 py-1 bg-[#f5e8e0] text-xs rounded-full text-[#662b1f] font-normal"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  HR Manager
                </motion.span>
              </h1>
              <motion.p 
                className="text-xs md:text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {formattedDate}
              </motion.p>
            </div>
          </div>

          <motion.div 
            className="flex items-center gap-3 md:gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#f5e8e0] transition-colors border border-[#f0e8e4] group"
              >
                <span className="font-medium text-gray-800 text-sm">My Profile</span>
                <motion.div
                  animate={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight size={16} className="text-[#662b1f]" />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </motion.header>

        {/* Content Area with Entrance Animation */}
        <motion.div 
          className="flex-1 p-4 md:p-8 overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-md p-6 md:p-8 min-h-full border border-[#f0e8e4]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.6,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Main children content with fade-in effect */}
            <AnimatePresence mode="wait">
              <motion.div
                key={window.location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default DashboardLayout;