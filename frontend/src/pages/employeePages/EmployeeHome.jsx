import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  ArrowRight,
  Check,
  X,
  CalendarDays,
  File,
  GraduationCap,
  ClipboardList,
  Briefcase,
  TrendingUp,
  User,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Sun,
  Moon,
  Zap,
  Target,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import API from "../../api/api";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EmployeeHome() {
  // Employee data and attendance state
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [leaveInfo, setLeaveInfo] = useState(null);
  const [autoCheckoutDone, setAutoCheckoutDone] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  // Calendar and announcements state
  const [activeTab, setActiveTab] = useState("quickAccess");
  const [displayedYear, setDisplayedYear] = useState(new Date().getFullYear());
  const [displayedMonth, setDisplayedMonth] = useState(new Date().getMonth());
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState(false);

  useDocumentTitle("Employee Home");

  // Initialize toast notifications
  const showNotification = (title, message, type = "info") => {
    const toastOptions = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    };

    switch (type) {
      case "success":
        toast.success(`${title}: ${message}`, toastOptions);
        break;
      case "error":
        toast.error(`${title}: ${message}`, toastOptions);
        break;
      case "warning":
        toast.warn(`${title}: ${message}`, toastOptions);
        break;
      case "info":
      default:
        toast.info(`${title}: ${message}`, toastOptions);
        break;
    }
  };

  // Fetch employee profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/employee/me");
      setEmployee(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      showNotification(
        "Error",
        err.response?.data?.message || "Failed to load profile",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance status
  const fetchAttendanceStatus = async () => {
    try {
      const res = await API.get("/api/employee/attendance/today");
      setAttendanceStatus(res.data);
    } catch (err) {
      console.error("Failed to get attendance status:", err);
      showNotification(
        "Error",
        err.response?.data?.message || "Failed to load attendance status",
        "error"
      );
    }
  };

  // Fetch leave info
  const fetchLeaveInfo = async () => {
    try {
      const res = await API.get("/api/employee/leave-info");
      setLeaveInfo(res.data);
    } catch (err) {
      console.error("Failed to fetch leave info:", err);
      showNotification("Error", "Failed to load leave information", "error");
    }
  };

  // Check-in handler
  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      await API.post("/api/employee/check-in");
      fetchAttendanceStatus();
      showNotification("Success", "Checked in successfully!", "success");
    } catch (err) {
      showNotification(
        "Error",
        err.response?.data?.message || "Failed to check in",
        "error"
      );
    } finally {
      setCheckInLoading(false);
    }
  };

  // Check-out handler
  const handleCheckOut = async () => {
    setCheckOutLoading(true);
    try {
      await API.post("/api/employee/check-out");
      fetchAttendanceStatus();
      showNotification("Success", "Checked out successfully!", "success");
    } catch (err) {
      showNotification(
        "Error",
        err.response?.data?.message || "Failed to check out",
        "error"
      );
    } finally {
      setCheckOutLoading(false);
    }
  };

  // Auto-checkout
  const handleAutoCheckOut = async () => {
    try {
      await API.post("/api/employee/check-out");
      fetchAttendanceStatus();
      showNotification(
        "Auto Check Out",
        "You have been automatically checked out at 5 PM",
        "info"
      );
      setAutoCheckoutDone(true);
    } catch (err) {
      console.error("Failed to auto check out:", err);
      showNotification(
        "Error",
        "Failed to perform automatic check out",
        "error"
      );
    }
  };

  // Effect to check the time and attendance status
  useEffect(() => {
  const checkAutoCheckout = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // Check for reminder at 1:14 PM (13:14)
    if (currentHour === 16 && currentMinutes === 50 && !attendanceStatus?.checkOut) {
      setShowReminder(true);
    }
    
    // Check for auto-checkout at 1:15 PM (13:15)
    if (currentHour === 17 && currentMinutes === 0 && !autoCheckoutDone) {
      if (attendanceStatus?.checkIn && !attendanceStatus?.checkOut) {
        handleAutoCheckOut();
      }
    }
  };

  // Check every minute (60000ms)
  const interval = setInterval(checkAutoCheckout, 6000);
  
  // Check immediately on mount
  checkAutoCheckout();

  return () => clearInterval(interval);
}, [attendanceStatus, autoCheckoutDone]);

  // Check out status reset every midnight
  useEffect(() => {
    const resetAtMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setAutoCheckoutDone(false);
        setShowReminder(false);
      }
    };

    const interval = setInterval(resetAtMidnight, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch announcements for a specific date
  const fetchAnnouncementsByDate = async (date) => {
    try {
      const res = await API.get(
        `/api/employee/announcements/date/${date.toISOString()}`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching announcements:", err);
      showNotification(
        "Error",
        "Failed to load announcements for this date",
        "error"
      );
      return [];
    }
  };

  const fetchUpcomingAnnouncements = async () => {
    try {
      const res = await API.get("/api/employee/announcements/upcoming");
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Error fetching upcoming announcements:", err);
      showNotification(
        "Error",
        "Failed to load announcements. Please try again later.",
        "error"
      );
    }
  };

  // In EmployeeHome component
  useEffect(() => {
    // Initial fetch
    fetchUpcomingAnnouncements();

    // Set up polling every 1 minute
    const interval = setInterval(fetchUpcomingAnnouncements, 60000);

    return () => clearInterval(interval);
  }, []);

  // Generate calendar days with announcements
  const generateDays = async (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const adjustedFirstDay = (firstDay + 6) % 7; // Monday-start week

    const days = [];

    // Add empty slots for days before the 1st of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({ day: "", isCurrentDay: false, isWeekend: false });
    }

    // Add all days in the month
    for (let i = 1; i <= lastDate; i++) {
      const dayOfWeek = new Date(year, month, i).getDay();
      const date = new Date(year, month, i);
      const dateString = date.toISOString().split("T")[0];

      // Check if this date has any announcements
      const dateAnnouncements = await fetchAnnouncementsByDate(date);

      days.push({
        day: i,
        date: dateString,
        isCurrentDay:
          i === new Date().getDate() &&
          month === new Date().getMonth() &&
          year === new Date().getFullYear(),
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        hasAnnouncements: dateAnnouncements.length > 0,
        announcements: dateAnnouncements,
      });
    }

    return days;
  };

  // Format time display
  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12)
      return {
        text: "Good Morning",
        icon: Sun,
        gradient: "from-amber-400 to-orange-500",
      };
    if (hour < 18)
      return {
        text: "Good Afternoon",
        icon: Sun,
        gradient: "from-blue-400 to-cyan-500",
      };
    return {
      text: "Good Evening",
      icon: Moon,
      gradient: "from-indigo-500 to-purple-600",
    };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAttendanceStatus();
      fetchLeaveInfo();
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchAttendanceStatus();
    fetchLeaveInfo();
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Update calendar when month/year changes
  useEffect(() => {
    const updateCalendar = async () => {
      const days = await generateDays(displayedYear, displayedMonth);
      setDaysInMonth(days);
    };
    updateCalendar();
  }, [displayedYear, displayedMonth]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === "calendar") {
        fetchUpcomingAnnouncements();
        generateDays(displayedYear, displayedMonth).then(setDaysInMonth);
      }
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [activeTab, displayedYear, displayedMonth]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      },
    },
  };

  const cardHoverVariants = {
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
      transition: { duration: 0.3 },
    },
  };

  // QuickAccessCard component
  const QuickAccessCard = ({
    icon: Icon,
    title,
    description,
    link,
    gradient,
  }) => (
    <motion.div
      variants={itemVariants}
      whileHover="hover"
      className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 overflow-hidden cursor-pointer"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
      ></div>
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
      ></div>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-30 transition-opacity duration-500">
        <div className="flex space-x-1">
          <div
            className="w-1 h-1 bg-current rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="w-1 h-1 bg-current rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-1 h-1 bg-current rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>

      <Link to={link} className="relative block h-full">
        <div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
        >
          <Icon size={24} className="text-white" />
        </div>

        <h3 className="font-bold text-gray-800 mb-3 text-lg group-hover:text-gray-900 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-6 group-hover:text-gray-700 transition-colors leading-relaxed">
          {description}
        </p>

        <div className="flex items-center justify-between">
          <div
            className={`flex items-center text-transparent bg-gradient-to-r ${gradient} bg-clip-text font-semibold group-hover:translate-x-2 transition-transform duration-300`}
          >
            <span>Explore</span>
          </div>
          <div
            className={`p-2 rounded-full bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-45`}
          >
            <ArrowRight size={16} className="text-white" />
          </div>
        </div>
      </Link>
    </motion.div>
  );

  // CalendarView component
  const CalendarView = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-3"></div>
          <CalendarDays className="mr-3 text-blue-600" size={24} />
          {new Date(displayedYear, displayedMonth).toLocaleString("default", {
            month: "long",
          })}{" "}
          {displayedYear}
        </h3>
        <div className="flex space-x-2">
          <button
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            onClick={() => {
              if (displayedMonth === 0) {
                setDisplayedMonth(11);
                setDisplayedYear(displayedYear - 1);
              } else {
                setDisplayedMonth(displayedMonth - 1);
              }
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            onClick={() => {
              if (displayedMonth === 11) {
                setDisplayedMonth(0);
                setDisplayedYear(displayedYear + 1);
              } else {
                setDisplayedMonth(displayedMonth + 1);
              }
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-bold text-gray-600 bg-gray-50/50 rounded-lg"
          >
            {day}
          </div>
        ))}
      </div>

      {calendarLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-gray-600">Loading calendar...</span>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2 mb-6">
          {daysInMonth.map((day, index) => (
            <div
              key={index}
              className={`p-3 text-center text-sm rounded-xl cursor-pointer transition-all duration-200 ${
                day.isCurrentDay
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg transform scale-105"
                  : day.isWeekend
                  ? "text-red-600 font-semibold"
                  : day.day
                  ? "hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium"
                  : "text-transparent"
              }`}
              onMouseEnter={() => setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {day.day}
              {day.hasAnnouncements && (
                <div className="absolute bottom-1 left-0 right-0 flex justify-center space-x-1">
                  {day.announcements.slice(0, 3).map((ann, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: ann.color }}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {hoveredDate && hoveredDate.hasAnnouncements && (
        <div className="absolute z-10 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <h4 className="font-bold text-sm mb-2">
            Events on {hoveredDate.date}
          </h4>
          <div className="space-y-2">
            {hoveredDate.announcements.map((ann, i) => (
              <div key={i} className="flex items-start">
                <div
                  className="w-3 h-3 rounded-full mt-1 mr-2 flex-shrink-0"
                  style={{ backgroundColor: ann.color }}
                ></div>
                <div>
                  <p className="text-sm font-semibold">{ann.title}</p>
                  {ann.time && (
                    <p className="text-xs text-gray-600">{ann.time}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-gray-200/50">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
          <Star className="mr-2 text-yellow-500" size={20} />
          Upcoming Events
        </h4>

        <div className="space-y-3">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="flex items-center p-4 rounded-xl border"
                style={{
                  background: `linear-gradient(to right, ${announcement.color}10, ${announcement.color}20)`,
                  borderColor: `${announcement.color}30`,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full mr-4 shadow-sm"
                  style={{ backgroundColor: announcement.color }}
                ></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    {announcement.title}
                  </p>
                  <p className="text-xs font-bold text-gray-600 mt-1">
                    {announcement.description}
                  </p>
                  <div className="flex justify-between items-end">
                    <p className="text-xs text-gray-600 font-medium">
                      {new Date(announcement.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                      {announcement.time && `, ${announcement.time}`}
                    </p>
                    <p className="text-xs text-gray-500 italic">
                      By: {announcement.createdByName}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No upcoming events
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // TabNavigation component
  const TabNavigation = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg mb-8 border border-white/50">
      <div className="flex space-x-2 p-2">
        {[
          {
            id: "quickAccess",
            label: "Quick Access",
            icon: <Sparkles size={18} />,
            color: "from-[#662b1f] to-[#8b3a1f]",
          },
          {
            id: "calendar",
            label: "Calendar",
            icon: <CalendarDays size={18} />,
            color: "from-blue-600 to-indigo-600",
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50/80"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <ArrowRight size={16} className="opacity-70" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  // Greeting based on time of day
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <div className="min-h-screen from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50">
        {showReminder && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mb-4"
          >
            <div className="bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center">
              <Clock className="mr-2" size={20} />
              <span className="text-sm">
                Don't forget to check out before 5 PM!
              </span>
              <button
                className="ml-4 text-yellow-200 hover:text-white"
                onClick={() => setShowReminder(false)}
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-400/20 via-purple-500/15 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/15 via-cyan-500/20 to-teal-600/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-pink-400/10 to-rose-500/15 rounded-full blur-2xl animate-bounce"
          style={{ animationDuration: "6s" }}
        ></div>
        <div
          className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-gradient-to-br from-amber-400/10 to-orange-500/15 rounded-full blur-2xl animate-bounce"
          style={{ animationDuration: "8s", animationDelay: "1s" }}
        ></div>
        <div className="absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 p-4 md:p-6 space-y-8"
      >
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            whileHover={cardHoverVariants.hover}
            className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Total Annual Leave
                </p>
                <p className="text-3xl font-bold text-gray-800 mb-1">
                  {leaveInfo?.totalAnnualLeave ?? 0} days
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ClipboardList className="text-white" size={22} />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={cardHoverVariants.hover}
            className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Used Leave
                </p>
                <p className="text-3xl font-bold text-gray-800 mb-1">
                  {leaveInfo?.usedAnnualLeave ?? 0} days
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Check className="text-white" size={22} />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={cardHoverVariants.hover}
            className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Remaining Leave
                </p>
                <p
                  className={`text-3xl font-bold mb-1 ${
                    leaveInfo?.remainingAnnualLeave <= 3
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {leaveInfo?.remainingAnnualLeave ?? 0} days
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="text-white" size={22} />
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-br from-[#662b1f] via-[#7d3420] to-[#8a3b2d] rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              ></div>
            </div>

            <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse"></div>
            <div
              className="absolute bottom-4 left-4 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>

            <div className="relative">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                      <Clock size={24} />
                    </div>
                    <h2 className="text-2xl font-bold">Daily Attendance</h2>
                    <div className="px-3 py-1 rounded-full bg-orange-400/20 text-orange-100 text-sm font-medium flex items-center gap-1">
                      <Zap size={12} />
                      Active
                    </div>
                  </div>

                  {attendanceStatus && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-green-400/20">
                            <Check size={16} />
                          </div>
                          <span className="font-medium">Check In</span>
                        </div>
                        <p className="text-lg font-bold">
                          {attendanceStatus.checkIn
                            ? formatDate(attendanceStatus.checkIn)
                            : "Not checked in"}
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-red-400/20">
                            <X size={16} />
                          </div>
                          <span className="font-medium">Check Out</span>
                        </div>
                        <p className="text-lg font-bold">
                          {attendanceStatus.checkOut
                            ? formatDate(attendanceStatus.checkOut)
                            : "Not checked out"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4 w-full md:w-auto min-w-[200px]">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCheckIn}
                    disabled={checkInLoading || attendanceStatus?.checkIn}
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                      attendanceStatus?.checkIn
                        ? "bg-gray-400/50 cursor-not-allowed backdrop-blur-sm"
                        : "bg-white text-[#662b1f] hover:bg-gray-50 hover:shadow-xl shadow-lg"
                    }`}
                  >
                    {checkInLoading ? (
                      <div className="w-5 h-5 border-2 border-[#662b1f] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Check size={20} />
                    )}
                    {checkInLoading ? "Processing..." : "Check In"}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCheckOut}
                    disabled={
                      checkOutLoading ||
                      !attendanceStatus?.checkIn ||
                      attendanceStatus?.checkOut
                    }
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                      !attendanceStatus?.checkIn || attendanceStatus?.checkOut
                        ? "bg-gray-400/50 cursor-not-allowed backdrop-blur-sm"
                        : "bg-white text-[#662b1f] hover:bg-gray-50 hover:shadow-xl shadow-lg"
                    }`}
                  >
                    {checkOutLoading ? (
                      <div className="w-5 h-5 border-2 border-[#662b1f] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <X size={20} />
                    )}
                    {checkOutLoading ? "Processing..." : "Check Out"}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <TabNavigation />
        </motion.div>

        {activeTab === "quickAccess" ? (
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-[#662b1f] to-[#8a3b2d] rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Quick Access
                  </h2>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickAccessCard
                icon={CalendarDays}
                title="Leave Permission"
                description="Request time off and manage your leave balance with ease"
                link="/employee/leave"
                gradient="from-blue-500 to-indigo-600"
              />
              <QuickAccessCard
                icon={File}
                title="Salary Slip"
                description="View detailed salary information and download statements"
                link="/employee/salary-slip"
                gradient="from-emerald-500 to-teal-600"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <CalendarView />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default EmployeeHome;