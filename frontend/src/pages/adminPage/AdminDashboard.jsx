import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  LogOut,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
  X,
  Clock,
  Sparkles,
  CalendarDays,
  Star,
  Sun,
  Moon,
  Zap,
  Target,
  Award,
  ClipboardList,
  Briefcase,
  Users,
  Key,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";
import API from "../../api/api";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminDashboard() {
  const [admins, setAdmins] = useState([]);
  const [hrs, setHRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("admins");
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "hr",
  });
  const navigate = useNavigate();

  useDocumentTitle("Admin Dashboard");

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

  // Fetch all admins and HRs
  const fetchData = async () => {
    try {
      setLoading(true);
      const [adminsRes, hrsRes] = await Promise.all([
        API.get("/api/admin"),
        API.get("/api/admin/hr"),
      ]);
      setAdmins(adminsRes.data);
      setHRs(hrsRes.data);
    } catch (err) {
      toast.error("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call your logout API if you have one
      await API.post("/api/admin/logout");
      
      // Remove token from local storage
      localStorage.removeItem("token");
      
      // Show success message
      toast.success("Logged out successfully");
      
      // Redirect to login page
      navigate("/");
    } catch (err) {
      toast.error("Failed to logout");
      console.error(err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.role === "hr") {
        await API.post("/api/admin/hr/register", formData);
        toast.success("HR registered successfully");
      } else {
        await API.post("/api/admin/register", formData);
        toast.success("Admin registered successfully");
      }
      setShowRegisterForm(false);
      setFormData({ username: "", email: "", password: "", role: "hr" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  // Handle delete
  const handleDelete = async (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        if (type === "hr") {
          await API.delete(`/api/admin/hr/delete/${id}`);
          toast.success("HR deleted successfully");
        } if (type === "admin") {
          await API.delete(`/api/admin/delete/${id}`);
          toast.success("Admin deleted successfully");
        }
        fetchData();
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
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
    fetchData();
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <div className="min-h-screen from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-400/20 via-purple-500/15 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/15 via-cyan-500/20 to-teal-600/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
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
        {/* Header */}
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

            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                    <Key size={24} />
                  </div>
                  <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                  <div className="px-3 py-1 rounded-full bg-orange-400/20 text-orange-100 text-sm font-medium flex items-center gap-1">
                    <Zap size={12} />
                    Admin Privileges
                  </div>
                </div>
                <p className="text-white/90 flex items-center gap-2">
                  <GreetingIcon size={18} />
                  {greeting.text}, Administrator
                </p>
              </div>

              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRegisterForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-[#662b1f] rounded-xl font-semibold hover:bg-gray-50 hover:shadow-lg transition-all"
                >
                  <Plus size={18} />
                  Register New {activeTab === "admins" ? "Admin" : "HR"}
                </motion.button>
            {/* New Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 hover:shadow-lg transition-all border border-white/20"
                  title="Logout"
                >
                  <LogOut size={18} />
                  <span className="hidden md:inline">Logout</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Stats Cards */}
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
                  Total Admins
                </p>
                <p className="text-3xl font-bold text-gray-800 mb-1">
                  {admins.length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <User className="text-white" size={22} />
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
                  Total HRs
                </p>
                <p className="text-3xl font-bold text-gray-800 mb-1">
                  {hrs.length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="text-white" size={22} />
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
                  Active Sessions
                </p>
                <p className="text-3xl font-bold text-gray-800 mb-1">
                  {admins.length + hrs.length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Lock className="text-white" size={22} />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg mb-8 border border-white/50">
            <div className="flex space-x-2 p-2">
              {[
                {
                  id: "admins",
                  label: "Admin Accounts",
                  icon: <User size={18} />,
                  color: "from-[#662b1f] to-[#8b3a1f]",
                },
                {
                  id: "hrs",
                  label: "HR Accounts",
                  icon: <Users size={18} />,
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
        </motion.div>

        {/* Registration Form */}
        {showRegisterForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-[#8a3b2d] rounded-full mr-3"></div>
              Register New {activeTab === "admins" ? "Admin" : "HR"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <User className="mr-2 text-[#662b1f]" size={16} />
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Mail className="mr-2 text-[#662b1f]" size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Lock className="mr-2 text-[#662b1f]" size={16} />
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Users className="mr-2 text-[#662b1f]" size={16} />
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  >
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#662b1f] to-[#8a3b2a] text-white rounded-xl hover:opacity-90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                >
                  Register
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Data Table */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/50">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Username
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200/30">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center space-x-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#662b1f]"></div>
                          <span className="text-gray-600">Loading data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : activeTab === "admins" ? (
                    admins.length > 0 ? (
                      admins.map((admin) => (
                        <tr key={admin._id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-[#662b1f] to-[#8a3b2a] flex items-center justify-center text-white font-bold">
                                {admin.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {admin.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {admin.email || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#662b1f]/10 text-[#662b1f]">
                              Admin
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDelete(admin._id, "admin")}
                              className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                              title="Delete Admin"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center">
                          <div className="text-gray-500">
                            No admin accounts found
                          </div>
                        </td>
                      </tr>
                    )
                  ) : hrs.length > 0 ? (
                    hrs.map((hr) => (
                      <tr key={hr._id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                              {hr.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {hr.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {hr.email || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            HR
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDelete(hr._id, "hr")}
                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete HR"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center">
                        <div className="text-gray-500">No HR accounts found</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default AdminDashboard;