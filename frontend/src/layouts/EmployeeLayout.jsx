import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Calendar,
  FileText,
  LogOut,
  ChevronRight,
  ChevronDown,
  User,
  Folder,
  GraduationCap,
  ClipboardList,
  File,
  Plane,
  Menu,
  X,
  ListCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChateraiseLogo from "../assets/Chateraise2.png";
import API from "../api/api";

const NavLink = ({
  to,
  icon: Icon,
  label,
  isNested = false,
  onClick,
  badgeCount,
}) => {
  const location = useLocation();
  const isActive =
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
          isNested ? "ml-6 pl-3 w-[calc(100%-24px)]" : ""
        } ${
          isActive
            ? "bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] text-white font-semibold shadow-lg"
            : "text-gray-700 hover:bg-gradient-to-r hover:from-[#f5e8e0] hover:to-orange-50/50 hover:text-[#662b1f] hover:shadow-md"
        }`}
      >
        <Icon
          size={18}
          strokeWidth={isActive ? 2.5 : 2}
          className={isActive ? "text-white" : "group-hover:text-[#662b1f]"}
        />
        <span className="text-sm whitespace-nowrap">{label}</span>
        {badgeCount > 0 && (
          <span
            className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
              isActive
                ? "bg-white/20 text-white"
                : "bg-orange-100 text-[#662b1f]"
            }`}
          >
            {badgeCount}
          </span>
        )}
      </Link>
    </motion.div>
  );
};

function EmployeeLayout({ children }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandRecord, setExpandRecord] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await API.get("/api/employee/me");
      setProfile(response.data);
      setFormData({
        username: response.data.username || "",
      });
    } catch (err) {
      localStorage.clear();
      navigate("/");
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
      const token = localStorage.getItem("token");
      if (token) {
        await API.post(
          "/api/employee/logout",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (error) {}
    localStorage.clear();
    navigate("/");
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <div className="animate-pulse flex space-x-4 items-center">
          <div className="rounded-full bg-gradient-to-r from-[#662b1f] to-orange-400 h-3 w-3"></div>
          <div className="text-gray-600 text-sm font-medium">
            Loading your workspace...
          </div>
          <Sparkles className="text-[#662b1f] animate-bounce" size={16} />
        </div>
      </div>
    );
  }

  const capitalizedName = profile.username
    ? profile.username.charAt(0).toUpperCase() + profile.username.slice(1)
    : "";

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const toggleRecordMenu = () => setExpandRecord(!expandRecord);
  const location = useLocation();
  const isRecordActive =
    location.pathname.includes("/employee/education") ||
    location.pathname.includes("/employee/training");

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 overflow-hidden">
      {/* Background decorative elements - Consistent with HR layout */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#662b1f]/5 to-orange-200/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar - Employee version */}
      <aside
        className={`fixed lg:static w-72 bg-white/95 backdrop-blur-xl h-full border-r border-white/50 py-8 flex flex-col z-30 shadow-2xl transition-all duration-300 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="mb-10 px-6">
          <div className="flex items-center justify-between mb-6">
            <img
              src={ChateraiseLogo}
              alt="Chateraise Logo"
              className="h-12 object-contain filter drop-shadow-sm"
            />
            <button
              className="lg:hidden text-gray-500 hover:text-[#662b1f] p-2 rounded-xl hover:bg-gray-50/80 transition-all duration-200"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Profile Card - Employee version */}
          <div className="bg-gradient-to-br from-[#fdf6f3] to-orange-50/30 rounded-2xl p-4 shadow-lg backdrop-blur-sm border border-white/60 relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#662b1f]/10 to-orange-200/20 rounded-full -translate-y-10 translate-x-10"></div>

            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ) : profile?.photo ? (
              <div className="flex items-center gap-3 relative">
                <div className="relative">
                  <img
                    src={`${API.defaults.baseURL}${profile.photo}`}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div>
                  <h4 className="font-bold text-[#662b1f] flex items-center">
                    {capitalizedName}
                  </h4>
                  <p className="text-xs text-gray-600 font-medium bg-white/50 px-2 py-1 rounded-full">
                    {profile.department || "Employee"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 relative">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#662b1f] to-[#8a3b2d] flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white">
                    {capitalizedName.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div>
                  <h4 className="font-bold text-[#662b1f] flex items-center">
                    {capitalizedName}
                  </h4>
                  <p className="text-xs text-gray-600 font-medium bg-white/50 px-2 py-1 rounded-full">
                    {profile.department || "Employee"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Menu - Employee specific */}
        <nav className="flex-1 px-4 flex flex-col gap-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <div className="flex items-center px-4 mb-2">
            <div className="w-1 h-4 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-2"></div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Employee Menu
            </p>
          </div>

          <NavLink
            to="http://103.134.154.55:4000/"
            icon={Home}
            label="Chateraise"
          />

          <NavLink
            to="/employee-dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            onClick={() => setSidebarOpen(false)}
          />

          <NavLink
            to="/employee/leave"
            icon={Plane}
            label="Leave Requests"
            onClick={() => setSidebarOpen(false)}
          />
          <NavLink
            to="/employee/salary-slip"
            icon={File}
            label="Salary Slips"
            onClick={() => setSidebarOpen(false)}
          />
        </nav>

        {/* Logout Button */}
        <div className="mt-auto mb-6 px-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-red-500 to-[#662b1f] hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-red-600 hover:to-[#7d3420] font-semibold relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            <LogOut size={18} className="relative z-10" />
            <span className="text-sm font-semibold relative z-10">Logout</span>
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl p-6 flex justify-between items-center border-b border-white/50 shadow-lg sticky top-0 z-10 relative">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-[#662b1f] hover:bg-gradient-to-r hover:from-[#f5e8e0] hover:to-orange-50/50 p-2 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#662b1f] to-orange-600 bg-clip-text text-transparent flex items-center">
                Welcome, {capitalizedName}
                <span className="hidden sm:inline-block ml-3 px-3 py-1 bg-gradient-to-r from-[#f5e8e0] to-orange-50/50 text-xs rounded-full text-[#662b1f] font-semibold border border-orange-200/50 shadow-sm">
                  {profile.department || "Employee"}
                </span>
              </h1>
              <p className="text-xs md:text-sm text-gray-600 font-medium flex items-center mt-1">
                <Clock size={14} className="mr-1 text-blue-500" />
                {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Time Display */}
            <div className="hidden sm:flex items-center space-x-3">
              <Clock size={18} className="text-blue-500" />
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>

            {/* Profile Link */}
            <Link
              to="/employee/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#f5e8e0] hover:to-orange-50/50 transition-all duration-200 border border-white/50 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-lg hover:scale-105 group"
            >
              <span className="font-semibold text-gray-800 text-sm">
                My Profile
              </span>
              <ChevronRight
                size={16}
                className="text-[#662b1f] group-hover:translate-x-1 transition-transform duration-200"
              />
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 min-h-full border border-white/50 relative overflow-hidden">
            {/* Decorative background elements for content area */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#662b1f]/3 to-orange-100/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100/10 to-purple-100/10 rounded-full translate-y-12 -translate-x-12"></div>

            {/* Main children content */}
            <div className="relative z-10">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EmployeeLayout;
