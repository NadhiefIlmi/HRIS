import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Calendar,
  LogOut,
  ChevronRight,
  Menu,
  LayoutDashboard,
  X,
  Plus,
  Sparkles,
  Clock,
  ChevronDown,
  ChevronUp,
  UserPlus,
  FileSpreadsheet,
} from "lucide-react";
import ChateraiseLogo from "../assets/Chateraise2.png";
import API from "../api/api";

const NavLink = ({ to, icon: Icon, label, badgeCount }) => {
  const location = useLocation();
  const isActive =
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
        isActive
          ? "bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] text-white font-semibold shadow-lg transform scale-105"
          : "text-gray-700 hover:bg-gradient-to-r hover:from-[#f5e8e0] hover:to-orange-50/50 hover:text-[#662b1f] hover:shadow-md hover:scale-105"
      }`}
    >
      <Icon
        size={18}
        strokeWidth={isActive ? 2.5 : 2}
        className={`${isActive ? "text-white" : "group-hover:text-[#662b1f]"}`}
      />
      <span className="text-sm whitespace-nowrap font-medium">{label}</span>
      {badgeCount > 0 && (
        <span
          className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
            isActive ? "bg-white/20 text-white" : "bg-orange-100 text-[#662b1f]"
          }`}
        >
          {badgeCount}
        </span>
      )}
      {isActive && !badgeCount && (
        <div className="ml-auto w-2 h-2 bg-white/30 rounded-full"></div>
      )}
    </Link>
  );
};

const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Check if any of the dropdown items are active
  const isEmployeesActive = location.pathname === "/employees" || 
                          location.pathname.startsWith("/employees/");
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
          isEmployeesActive
            ? "bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] text-white font-semibold shadow-lg"
            : "text-gray-700 hover:bg-gradient-to-r hover:from-[#f5e8e0] hover:to-orange-50/50 hover:text-[#662b1f] hover:shadow-md"
        }`}
      >
        <div className="flex items-center gap-3">
          <Users
            size={18}
            strokeWidth={isEmployeesActive ? 2.5 : 2}
            className={isEmployeesActive ? "text-white" : "text-green-600"}
          />
          <span className="text-sm whitespace-nowrap font-medium">Employees</span>
        </div>
        {isOpen ? (
          <ChevronUp size={16} className={isEmployeesActive ? "text-white" : "text-gray-500"} />
        ) : (
          <ChevronDown size={16} className={isEmployeesActive ? "text-white" : "text-gray-500"} />
        )}
      </button>

      {/* Dropdown Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-4 pt-2 space-y-1">
          <Link
            to="/employees"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
              location.pathname === "/employees"
                ? "bg-gradient-to-r from-[#662b1f]/10 to-[#8a3b2d]/10 text-[#662b1f] font-medium"
                : "text-gray-600 hover:bg-gradient-to-r hover:from-[#f5e8e0]/50 hover:to-orange-50/30 hover:text-[#662b1f]"
            }`}
          >
            <Users size={16} className="text-green-600" />
            <span>All Employees</span>
          </Link>
          <Link
            to="/employees/add"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
              location.pathname === "/employees/add"
                ? "bg-gradient-to-r from-[#662b1f]/10 to-[#8a3b2d]/10 text-[#662b1f] font-medium"
                : "text-gray-600 hover:bg-gradient-to-r hover:from-[#f5e8e0]/50 hover:to-orange-50/30 hover:text-[#662b1f]"
            }`}
          >
            <UserPlus size={16} className="text-yellow-500" />
            <span>Add Employee</span>
          </Link>
          <Link
            to="/employees/add-excell"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
              location.pathname === "/employees/add-excel"
                ? "bg-gradient-to-r from-[#662b1f]/10 to-[#8a3b2d]/10 text-[#662b1f] font-medium"
                : "text-gray-600 hover:bg-gradient-to-r hover:from-[#f5e8e0]/50 hover:to-orange-50/30 hover:text-[#662b1f]"
            }`}
          >
            <FileSpreadsheet size={16} className="text-blue-600" />
            <span>Add from Excel</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

function HRLayout({ children }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const [formData, setFormData] = useState({
    username: "",
  });

  // Fetch Profile from the API
  const fetchProfile = async () => {
    try {
      const response = await API.get("/api/hr/me");
      setProfile(response.data);
      setFormData({
        username: response.data.username || "",
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      if (err.response && err.response.status === 401) {
        localStorage.clear();
        navigate("/");
      }
    }
  };

  const fetchPendingLeavesCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/api/hr/count-pending-leaves", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingLeavesCount(response.data?.totalPendingRequests || 0);
    } catch (err) {
      console.error("Error fetching pending leaves count:", err);
    }
  };

  // Function to update count from child components
  const updatePendingLeavesCount = (count) => {
    setPendingLeavesCount(count);
  };

  useEffect(() => {
    fetchProfile();
    fetchPendingLeavesCount();

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Refresh pending leaves count every 5 minutes
    const leavesInterval = setInterval(() => {
      fetchPendingLeavesCount();
    }, 300000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(leavesInterval);
    };
  }, []);

  useEffect(() => {
    // Close sidebar when screen gets larger
    const handleResize = () => {
      if (window.innerWidth > 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await API.post(
          "/api/hr/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      localStorage.clear();
      navigate("/");
    }
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

  // Clone children and pass updatePendingLeavesCount as prop
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { updatePendingLeavesCount });
    }
    return child;
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 overflow-hidden">
      {/* Background decorative elements */}
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

      {/* Enhanced Sidebar */}
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

          {/* Enhanced Profile Card */}
          <div className="bg-gradient-to-br from-[#fdf6f3] to-orange-50/30 rounded-2xl p-4 shadow-lg backdrop-blur-sm border border-white/60 relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#662b1f]/10 to-orange-200/20 rounded-full -translate-y-10 translate-x-10"></div>

            {profile?.photo ? (
              <div className="flex items-center gap-3 relative">
                <div className="relative">
                  <img
                    src={`${API.defaults.baseURL}${profile.photo}`}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div>
                  <h4 className="font-bold text-[#662b1f] flex items-center">
                    {capitalizedName}
                    <Sparkles className="ml-1 text-orange-400" size={12} />
                  </h4>
                  <p className="text-xs text-gray-600 font-medium bg-white/50 px-2 py-1 rounded-full">
                    HR Manager
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 relative">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#662b1f] to-[#8a3b2d] flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white">
                    {capitalizedName.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div>
                  <h4 className="font-bold text-[#662b1f] flex items-center">
                    {capitalizedName}
                    <Sparkles className="ml-1 text-orange-400" size={12} />
                  </h4>
                  <p className="text-xs text-gray-600 font-medium bg-white/50 px-2 py-1 rounded-full">
                    HR Manager
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Main Menu */}
        <nav className="flex-1 px-4 flex flex-col gap-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <div className="flex items-center px-4 mb-2">
            <div className="w-1 h-4 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-2"></div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Main Menu
            </p>
          </div>

          <NavLink
            to="http://103.134.154.55:4000/"
            icon={Home}
            label="Chateraise"
          />
          <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

          {/* Replaced the old Employees section with the new DropdownMenu */}
          <DropdownMenu />

          <NavLink
            to="/leave-requests"
            icon={Calendar}
            label="Leave Requests"
            badgeCount={pendingLeavesCount}
          />
        </nav>

        {/* Enhanced Logout Button */}
        <div className="mt-auto mb-6 px-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-red-500 to-[#662b1f] hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-red-600 hover:to-[#7d3420] font-semibold relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            <LogOut size={18} className="relative z-10" />
            <span className="text-sm font-semibold relative z-10">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Enhanced Header */}
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
                Welcome back, {capitalizedName}
                <span className="hidden sm:inline-block ml-3 px-3 py-1 bg-gradient-to-r from-[#f5e8e0] to-orange-50/50 text-xs rounded-full text-[#662b1f] font-semibold border border-orange-200/50 shadow-sm">
                  HR Manager
                </span>
                <Sparkles
                  className="ml-2 text-orange-400 animate-pulse"
                  size={20}
                />
              </h1>
              <p className="text-xs md:text-sm text-gray-600 font-medium flex items-center mt-1">
                <Clock size={14} className="mr-1 text-blue-500" />
                {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Enhanced Time Display */}
            <div className="flex items-center space-x-3">
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

            {/* Enhanced Profile Link */}
            <Link
              to="/profile"
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

        {/* Enhanced Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 min-h-full border border-white/50 relative overflow-hidden">
            {/* Decorative background elements for content area */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#662b1f]/3 to-orange-100/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100/10 to-purple-100/10 rounded-full translate-y-12 -translate-x-12"></div>

            {/* Main children content */}
            <div className="relative z-10">{childrenWithProps}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HRLayout;