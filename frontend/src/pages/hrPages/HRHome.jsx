import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  UserCircle,
  CalendarCheck2,
  AlertCircle,
  ChevronRight,
  Users,
  Briefcase,
  Sparkles,
  TrendingUp,
  Clock,
  Bell,
  Plus,
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  Activity,
  DollarSign,
  Award,
  Target,
  Settings,
  Eye,
  Edit,
  ArrowUpRight,
  Zap,
  Heart,
  Star,
  ChevronLeft,
  Coffee,
  Globe,
  Layers,
  Percent,
} from "lucide-react";
import API from "../../api/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import useDocumentTitle from "../../hooks/useDocumentTitle";

function HRHome() {
  // Original state variables - preserved
  const [totalEmployees, setTotalEmployees] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(null);
  const [employeesError, setEmployeesError] = useState(false);
  const [pendingError, setPendingError] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");
  // Change currentMonth and currentYear to numeric states for easier manipulation
  const [displayedYear, setDisplayedYear] = useState(new Date().getFullYear());
  const [displayedMonth, setDisplayedMonth] = useState(new Date().getMonth()); // 0-based month index
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [genderError, setGenderError] = useState(false);
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({
    username: "",
  });

  // New enhanced features - additions only
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "New employee onboarding required",
      time: "2 hours ago",
      type: "info",
    },
    {
      id: 2,
      message: "Monthly report ready",
      time: "1 day ago",
      type: "success",
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // State for department distribution data from backend
  const [departmentData, setDepartmentData] = useState([]);

  // Calendar announcement states
  const [announcements, setAnnouncements] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    color: "#3B82F6",
  });
  const [hoveredDate, setHoveredDate] = useState(null);

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/api/hr/department-distribution", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepartmentData(res.data);
      } catch (err) {
        console.error("Error fetching department distribution data:", err);
        setDepartmentData([]);
      }
    };

    fetchDepartmentData();
  }, []);

  useDocumentTitle("HR Home");

  // Fetch gender data
  useEffect(() => {
    const fetchGenderData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/api/hr/gender-summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGenderData([
          { name: "Male", value: res.data.male, color: "#662b1f" },
          { name: "Female", value: res.data.female, color: "#a8441f" },
        ]);
        setGenderError(false);
      } catch (err) {
        console.error("Error fetching gender data:", err);
        setGenderError(true);
      }
    };

    fetchGenderData();
  }, []);

  // Fetch announcements when calendar tab is active
  useEffect(() => {
    if (activeTab === "calendar") {
      fetchUpcomingAnnouncements();
    }
  }, [activeTab]);

  // Fetch upcoming announcements
  const fetchUpcomingAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/api/hr/announcements/upcoming", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Error fetching upcoming announcements:", err);
    }
  };

  // Fetch announcements for a specific date
  const fetchAnnouncementsByDate = async (date) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(
        `/api/hr/announcements/date/${date.toISOString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching announcements:", err);
      return [];
    }
  };

  // Handle date click
  const handleDateClick = (day) => {
    if (!day.day) return;

    // Create date string in YYYY-MM-DD format
    const dateStr = `${displayedYear}-${String(displayedMonth + 1).padStart(
      2,
      "0"
    )}-${String(day.day).padStart(2, "0")}`;

    setSelectedDate(dateStr);
    setNewAnnouncement((prev) => ({
      ...prev,
      date: dateStr,
    }));
    setShowAnnouncementModal(true);
  };

  const handleAnnouncementSubmit = async (e) => {
  e.preventDefault();
  try {
    // Pastikan format date sesuai ISO (YYYY-MM-DD)
    const formattedDate = newAnnouncement.date;
    
    const payload = {
      ...newAnnouncement,
      date: formattedDate
    };

    const token = localStorage.getItem("token");
    await API.post("/api/hr/announcements", payload, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    setShowAnnouncementModal(false);
    setNewAnnouncement({
      title: "",
      description: "",
      date: selectedDate,
      time: "",
      color: "#3B82F6",
    });
    
    // Refresh data
    fetchUpcomingAnnouncements();
    setDaysInMonth(await generateDays(displayedYear, displayedMonth));
    
  } catch (err) {
    console.error("Error creating announcement:", err);
    // Tampilkan error lebih detail ke user
    alert(`Failed to create announcement: ${err.response?.data?.message || err.message}`);
  }
};

const handleDeleteAnnouncement = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.delete(`/api/hr/announcements/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log("Delete response:", response.data);
    
    // Refresh the calendar and upcoming events
    setDaysInMonth(await generateDays(displayedYear, displayedMonth));
    fetchUpcomingAnnouncements();
  } catch (err) {
    console.error("Error deleting announcement:", err);
    console.error("Error details:", err.response?.data);
    alert(`Failed to delete announcement: ${err.response?.data?.message || err.message}`);
  }
};  

  // Generate calendar days with announcements
  const generateDays = async (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    // Adjust firstDay for Monday-start week (Monday=0, Sunday=6)
    const adjustedFirstDay = (firstDay + 6) % 7;

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

  // Set greeting and generate calendar
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(new Date().toLocaleDateString("en-US", options));

    // Generate days when month or year changes
    const updateCalendar = async () => {
      setDaysInMonth(await generateDays(displayedYear, displayedMonth));
    };
    updateCalendar();
  }, [displayedYear, displayedMonth]);

  // Original useEffect for dashboard data and profile - preserved
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      try {
        const employeesResponse = await API.get("/api/hr/count-employees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTotalEmployees(employeesResponse.data?.totalEmployees ?? 0);
        setEmployeesError(false);
      } catch (error) {
        console.error("Error fetching total employees:", error);
        setEmployeesError(true);
      }

      try {
        const pendingResponse = await API.get("/api/hr/count-pending-leaves", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingRequests(pendingResponse.data?.totalPendingRequests ?? 0);
        setPendingError(false);
      } catch (error) {
        console.error("Error fetching pending requests:", error);
        setPendingError(true);
      }

      setLoading(false);
    };

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await API.get("/api/hr/me");
        setProfile(response.data);
        setFormData({
          username: response.data.username || "",
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setLoading(false);
        if (err.response && err.response.status === 401) {
          localStorage.clear();
          navigate("/");
        }
      }
    };

    fetchProfile();
    fetchDashboardData();
  }, []);

  // Original capitalized name logic - preserved
  const capitalizedName = profile.username
    ? profile.username.charAt(0).toUpperCase() + profile.username.slice(1)
    : "";

  return (
    <div className="min-h-screen from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#662b1f]/5 to-orange-200/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Welcome Section */}
        <div className="relative bg-gradient-to-r from-[#662b1f] via-[#7d3420] to-[#8b3a1f] rounded-3xl p-8 mb-8 text-white shadow-2xl overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/3 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full mr-4"></div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                  {greeting}, {capitalizedName}!
                </h2>
                <div className="ml-3 animate-bounce">
                  <Sparkles className="text-yellow-300" size={28} />
                </div>
              </div>
              <p className="text-white/90 text-lg font-medium mb-2">
                Ready to manage your team and drive success today?
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg mb-8 border border-white/50">
          <div className="flex space-x-2 p-2">
            {[
              {
                id: "overview",
                label: "Overview",
                icon: <Activity size={18} />,
                color: "from-[#662b1f] to-[#8b3a1f]",
              },
              {
                id: "calendar",
                label: "Calendar",
                icon: <Calendar size={18} />,
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
                  <ArrowUpRight size={16} className="opacity-70" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <>
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Employees Card - Enhanced */}
              <Link to="/employees" className="group block">
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#662b1f]/5 to-orange-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-3"></div>
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          Total Employees
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {loading ? (
                          <div className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 h-8 w-16 rounded-lg"></div>
                        ) : employeesError ? (
                          <span className="text-red-500 text-lg flex items-center">
                            <AlertCircle size={20} className="mr-2" />
                            Error
                          </span>
                        ) : (
                          <span className="bg-gradient-to-r from-[#662b1f] to-orange-600 bg-clip-text text-transparent">
                            {totalEmployees?.toLocaleString() || "0"}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        Active workforce
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-[#662b1f] to-[#8b3a1f] p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Users className="text-white" size={24} />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Pending Requests Card - Enhanced */}
              <Link to="/leave-requests" className="group block">
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full mr-3"></div>
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          Pending Requests
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {loading ? (
                          <div className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 h-8 w-16 rounded-lg"></div>
                        ) : pendingError ? (
                          <span className="text-red-500 text-lg flex items-center">
                            <AlertCircle size={20} className="mr-2" />
                            Error
                          </span>
                        ) : (
                          <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                            {pendingRequests?.toLocaleString() || "0"}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        Awaiting approval
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <CalendarCheck2 className="text-white" size={24} />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Add Employee Quick Action - Enhanced */}
              <Link to="/employees/add" className="group block">
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-3"></div>
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          Add Employee
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                          +
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        Quick action
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                      <Plus className="text-white" size={24} />
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Enhanced Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gender Distribution - Enhanced */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-3"></div>
                    <Users className="mr-3 text-[#662b1f]" size={24} />
                    Gender Distribution
                  </h3>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-[#662b1f] rounded-full"></div>
                    <div className="w-2 h-2 bg-[#a8441f] rounded-full"></div>
                  </div>
                </div>
                {genderError ? (
                  <div className="flex items-center justify-center h-48 text-red-500 bg-red-50 rounded-xl">
                    <AlertCircle className="mr-2" size={24} />
                    <span className="font-medium">
                      Failed to load gender data
                    </span>
                  </div>
                ) : (
                  <div className="h-48 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={8}
                          dataKey="value"
                          isAnimationActive={true}
                        >
                          {genderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {genderData.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {genderData.map((entry, index) => (
                      <div
                        key={index}
                        className="bg-gray-50/50 rounded-xl p-3 flex items-center"
                      >
                        <div
                          className="w-4 h-4 rounded-full mr-3 shadow-sm"
                          style={{ backgroundColor: entry.color }}
                        ></div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">
                            {entry.name}
                          </span>
                          <div className="text-xl font-bold text-gray-900">
                            {entry.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Briefcase className="mr-2 text-[#662b1f]" size={20} />
                    Department Distribution
                  </h3>
                  <BarChart3 className="text-gray-500" size={20} />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentData}
                      margin={{ top: 5, right: 30, left: 10, bottom: 1 }}
                      barCategoryGap="15%"
                      isAnimationActive={true}
                      animationDuration={1500}
                    >
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                        }}
                        formatter={(value) => [value, "Employees"]}
                      />
                      {/* 
                        Define a color map for departments to assign different colors
                      */}
                      {(() => {
                        const departmentColors = {
                          Production: "#3B82F6", // blue
                          Engineering: "#10B981", // green
                          Sales: "#F59E0B", // amber
                          Marketing: "#EF4444", // red
                          Finance: "#8B5CF6", // purple
                        };
                        return (
                          <Bar
                            dataKey="employees"
                            radius={[4, 4, 0, 0]}
                            name="Employees"
                            isAnimationActive={true}
                            animationDuration={1500}
                          >
                            {departmentData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={departmentColors[entry.name] || "#3B82F6"}
                              />
                            ))}
                          </Bar>
                        );
                      })()}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "calendar" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-3"></div>
                <Calendar className="mr-3 text-blue-600" size={24} />
                {new Date(displayedYear, displayedMonth).toLocaleString(
                  "default",
                  {
                    month: "long",
                  }
                )}{" "}
                {displayedYear}
              </h3>
              <div className="flex space-x-2">
                <button
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  onClick={() => {
                    // Decrement month
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
                    // Increment month
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

            <div className="grid grid-cols-7 gap-2 mb-6">
              {daysInMonth.map((day, index) => (
                <div
                  key={index}
                  className={`p-3 text-center text-sm rounded-xl cursor-pointer transition-all duration-200 relative ${
                    day.isCurrentDay
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg transform scale-105"
                      : day.isWeekend
                      ? "text-red-600 font-semibold"
                      : day.day
                      ? "hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium"
                      : "text-transparent"
                  }`}
                  onClick={() => handleDateClick(day)}
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

            {/* Tooltip for hovered dates */}
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

            {/* Enhanced Calendar Events */}
            <div className="pt-6 border-t border-gray-200/50">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                <Star className="mr-2 text-yellow-500" size={20} />
                Upcoming Events
              </h4>

              <div className="space-y-3">
                {announcements.map((announcement) => (
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
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-gray-900">
                          {announcement.title}
                        </p>
                        {announcement.createdBy._id === profile._id && (
                          <button
                            onClick={() =>
                              handleDeleteAnnouncement(announcement._id)
                            }
                            className="text-gray-400 hover:text-red-500 ml-2"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                      <p className="text-xs font-bold text-gray-600 mt-1">
                        {announcement.description}
                      </p>
                      <div className="flex justify-between items-end">
                        <p className="text-xs text-gray-600 font-medium">
                          {new Date(announcement.date).toLocaleDateString(
                            "en-US",
                            { weekday: "long", month: "short", day: "numeric" }
                          )}
                          {announcement.time && `, ${announcement.time}`}
                        </p>
                        <p className="text-xs text-gray-500 italic">
                          By:{" "}
                          {announcement.createdBy.username ||
                            announcement.createdByName}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {announcements.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No upcoming events
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Announcement Modal */}
        {showAnnouncementModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Add New Announcement</h3>
              <form onSubmit={handleAnnouncementSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    value={newAnnouncement.description}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={newAnnouncement.date}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time (optional)
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={newAnnouncement.time}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          time: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex space-x-2">
                    {[
                      "#3B82F6",
                      "#10B981",
                      "#F59E0B",
                      "#EF4444",
                      "#8B5CF6",
                    ].map((color) => (
                      <div
                        key={color}
                        className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                          newAnnouncement.color === color
                            ? "border-gray-800"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          setNewAnnouncement({ ...newAnnouncement, color })
                        }
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    onClick={() => setShowAnnouncementModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Save Announcement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-[#662b1f] to-orange-500 rounded-full"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              &copy; 2024 HR Management System
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Built with care for better workforce management ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HRHome;
