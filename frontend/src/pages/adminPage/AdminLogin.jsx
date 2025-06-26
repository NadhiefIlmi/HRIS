import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, User, ArrowRight, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import API from "../../api/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminLogin() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await API.post("/api/admin/login", formData);
      localStorage.setItem("token", response.data.token);
      toast.success("Login successful");
      navigate("/admin-dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
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

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#662b1f]/5 via-[#7d3420]/5 to-[#8a3b2d]/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/15 via-cyan-500/20 to-teal-600/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-[#662b1f] to-[#8a3b2a] rounded-full opacity-20 animate-ping"
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/30">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#662b1f] via-[#7d3420] to-[#8a3b2d] p-8 text-white text-center relative">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              ></div>
            </div>
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Lock size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Admin Portal</h1>
              <p className="flex items-center justify-center gap-2 text-white/90">
                <GreetingIcon size={18} />
                {greeting.text}, please sign in
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
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
                    autoFocus
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

                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#662b1f] to-[#8a3b2a] text-white rounded-xl hover:opacity-90 transition-all duration-300 font-medium shadow-lg"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-[#662b1f] hover:text-[#8a3b2a] font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Company Name. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminLogin;