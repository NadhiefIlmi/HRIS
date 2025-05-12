import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Calendar, FileText, LogOut, ChevronRight, ChevronDown,
  User, Folder, GraduationCap, ClipboardList, File, Plane, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChateraiseLogo from '../assets/Chateraise2.png';
import API from '../api/api';

const NavLink = ({ to, icon: Icon, label, isNested = false, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
          isNested ? 'ml-6 pl-3 w-[calc(100%-24px)]' : ''
        } ${
          isActive
            ? 'bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] text-white font-medium shadow-md'
            : 'text-gray-700 hover:bg-[#f5e8e0] hover:text-[#662b1f]'
        }`}
      >
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-sm whitespace-nowrap">{label}</span>
      </Link>
    </motion.div>
  );
};

function EmployeeLayout({ children }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandRecord, setExpandRecord] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
          username: ''
        });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/employee/me');
      setProfile(response.data);
      setFormData({
        username: response.data.username || ''
      });
    } catch (err) {
      localStorage.clear();
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await API.post('/api/employee/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {}
    localStorage.clear();
    navigate('/');
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-sm">Please wait...</p>
      </div>
    );
  }

  const capitalizedName = profile.username
  ? profile.username.charAt(0).toUpperCase() + profile.username.slice(1)
  : '';
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const toggleRecordMenu = () => setExpandRecord(!expandRecord);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const location = useLocation();
  const isRecordActive =
    location.pathname.includes('/employee/education') ||
    location.pathname.includes('/employee/training');

  const sidebar = (
    <div className="flex flex-col justify-between h-full">
      <div className="px-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center mb-6"
        >
          <img src={ChateraiseLogo} alt="Chateraise Logo" className="h-14 object-contain" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#fdf6f3] rounded-2xl p-4 shadow-sm mb-6 backdrop-blur-sm border border-white/20"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ) : profile?.photo ? (
            <div className="flex items-center gap-3">
              <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                src={`${API.defaults.baseURL}${profile.photo}`}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div>
                <h4 className="font-semibold text-[#662b1f]">{capitalizedName}</h4>
                <p className="text-xs text-gray-500">Employee</p>
                <p className="text-xs text-gray-500">{profile.department || 'Unknown Department'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#662b1f] to-[#8a3b2d] flex items-center justify-center text-white font-semibold text-lg shadow-md border-2 border-white"
              >
                {capitalizedName.charAt(0)}
              </motion.div>
              <div>
                <h4 className="font-semibold text-[#662b1f]">{capitalizedName}</h4>
                <p className="text-xs text-gray-500">Employee</p>
                <p className="text-xs text-gray-500">{profile?.department || 'Unknown Department'}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <motion.nav 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col gap-2"
        >
          <p className="px-4 text-xs font-medium text-gray-400 mb-1">MAIN MENU</p>
          <NavLink 
            to="/employee-dashboard" 
            icon={Home} 
            label="Dashboard" 
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Record Section with Dropdown */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleRecordMenu}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              isRecordActive
                ? 'bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] text-white font-medium shadow-md'
                : 'text-gray-700 hover:bg-[#f5e8e0] hover:text-[#662b1f]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Folder size={18} strokeWidth={isRecordActive ? 2.5 : 2} />
              <span className="text-sm whitespace-nowrap">Records</span>
            </div>
            <motion.div
              animate={{ rotate: expandRecord ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </motion.button>

          {/* Submenu with animation */}
          <AnimatePresence>
            {expandRecord && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <NavLink 
                  to="/employee/education" 
                  icon={GraduationCap} 
                  label="Education History" 
                  isNested 
                  onClick={() => setMobileMenuOpen(false)}
                />
                <NavLink 
                  to="/employee/training" 
                  icon={ClipboardList} 
                  label="Training History" 
                  isNested 
                  onClick={() => setMobileMenuOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <NavLink 
            to="/employee/leave" 
            icon={Plane} 
            label="Leave Permission" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <NavLink 
            to="/employee/salary-slip" 
            icon={File} 
            label="Salary Slips" 
            onClick={() => setMobileMenuOpen(false)}
          />
        </motion.nav>
      </div>

      {/* Logout Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="px-4 mt-4 pb-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-red-600 to-[#662b1f] hover:shadow-md transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </motion.button>
      </motion.div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8f5f3] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 bg-white border-r border-[#f0e8e4] py-8 flex-col justify-between shadow-lg fixed h-screen z-20">
        {sidebar}
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 z-30 p-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleMobileMenu}
          className="p-2 rounded-full bg-white shadow-md text-[#662b1f]"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-20 bg-white md:hidden w-72 shadow-xl"
          >
            {sidebar}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-10 bg-black md:hidden"
            onClick={toggleMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="md:ml-72 flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-10 bg-white p-4 md:p-6 flex justify-between items-center border-b border-[#f0e8e4] shadow-sm"
        >
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#662b1f]">Hello, {capitalizedName}</h1>
            <p className="text-xs md:text-sm text-gray-500">{formattedDate}</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/employee/profile"
              className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1 md:py-2 rounded-xl hover:bg-[#f8f5f3] transition-colors"
            >
              <User size={18} className="text-gray-600" />
              <span className="font-medium text-gray-800 text-sm md:text-base">My Profile</span>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          </motion.div>
        </motion.header>

        {/* Page Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8f5f3]"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md p-4 md:p-8 min-h-full backdrop-blur-sm border border-[#f0e8e4]"
          >
            {children}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default EmployeeLayout;