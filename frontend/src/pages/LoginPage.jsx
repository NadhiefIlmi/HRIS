import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ChevronRight, Lock, User, Calendar, Sparkles, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/api';
import ChateraiseLogo from '../assets/Chateraise1.png';
import SideImage from '../assets/image.jpg';
import useDocumentTitle from '../hooks/useDocumentTitle';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('hr');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  useDocumentTitle("Login - Chateraise HR System");

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Please fill in both fields.');
      setLoading(false);
      return;
    }

    const endpoint = role === 'hr' ? '/api/hr/login' : '/api/employee/login';

    try {
      const response = await API.post(endpoint, { username, password });
      const token = response.data.token;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);

      navigate(role === 'hr' ? '/dashboard' : '/employee-dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Refined animation variants
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const slideVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const formVariants = {
    hidden: { x: 30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.1 }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen w-full font-sans bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col lg:flex-row overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-[#662b1f]/5 to-pink-200/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-[#662b1f]/5 to-amber-200/10 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Left Side Image with Enhanced Overlay */}
      <motion.div 
        className="w-full lg:w-3/5 h-48 sm:h-64 md:h-80 lg:h-screen relative overflow-hidden order-1 lg:order-1"
        variants={slideVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.img
          src={SideImage}
          alt="Login Illustration"
          className="object-cover w-full h-full"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#662b1f]/90 via-[#662b1f]/70 to-[#8a3b2d]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Floating particles effect */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5
              }}
            />
          ))}
        </div>

        {/* Content overlay */}
        <motion.div 
          className="absolute inset-0 flex flex-col justify-between p-3 sm:p-4 md:p-6 lg:p-10 text-white z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div>
            <motion.div 
              className="flex items-center gap-2 mb-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="relative">
                <Calendar size={16} className="text-white/90 sm:block hidden" />
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-xs sm:text-sm font-light text-white/90 backdrop-blur-sm bg-white/10 px-2 py-1 rounded-full">
                <span className="hidden sm:inline">{formattedDate} • </span>
                {formattedTime}
              </span>
            </motion.div>
            
            <motion.div
              variants={floatingVariants}
              animate="animate"
            >
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
                Welcome to Chateraise
              </h1>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-pink-300" />
                <p className="bg-gradient-to-r from-pink-200 via-white to-pink-200 bg-clip-text text-transparent text-sm sm:text-base md:text-lg lg:text-xl font-medium">
                  Employee Management System
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="backdrop-blur-md bg-white/15 p-3 sm:p-4 md:p-6 rounded-2xl w-full lg:w-2/3 border border-white/30 shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            whileHover={{ 
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              y: -5
            }}
          >
            {/* Glass effect background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse" />
                <p className="text-sm sm:text-base lg:text-lg font-semibold text-white">
                  HR Management System
                </p>
              </div>
              <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
                Efficiently manage your workforce with our comprehensive HR solution.
                <span className="hidden sm:inline"> Transform your HR processes with intelligent automation.</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right Side Login Form */}
      <motion.div 
        className="w-full lg:w-2/5 flex-1 lg:h-screen flex items-center justify-center bg-white/80 backdrop-blur-sm px-4 sm:px-6 md:px-8 py-6 sm:py-8 lg:py-0 order-2 lg:order-2 relative"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Form background decoration */}
        <div className="absolute inset-0 bg-gradient-to-bl from-white via-gray-50/50 to-white" />
        
        <motion.div 
          className="w-full max-w-md relative z-10"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <motion.div 
            className="text-center mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div 
              className="flex justify-center items-center relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <img src={ChateraiseLogo} alt="Chateraise Logo" className="h-15 sm:h-16 md:h-20 relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#662b1f]/20 to-pink-200/20 rounded-full blur-xl"
                  animate={{
                    scale: isHovered ? 1.2 : 1,
                    opacity: isHovered ? 0.6 : 0.3,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 via-[#662b1f] to-gray-800 bg-clip-text text-transparent mt-3 sm:mt-4">
              Sign in to your account
            </h2>
          </motion.div>

          <motion.form 
            onSubmit={handleLogin} 
            className="space-y-4 sm:space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Enhanced Role Selection with Icons */}
            <motion.div 
              className="flex justify-center mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-1.5 rounded-2xl flex w-full max-w-xs shadow-inner border border-gray-200/50">
                {[
                  { value: 'hr', label: 'HR Manager', icon: Shield },
                  { value: 'employee', label: 'Employee', icon: Users }
                ].map(({ value, label, icon: Icon }) => (
                  <motion.button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 rounded-xl relative overflow-hidden flex items-center justify-center gap-1.5
                      ${role === value
                        ? 'text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-800'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {role === value && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[#662b1f] to-[#8a3b2d]"
                        layoutId="activeRole"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-1.5">
                      <motion.div
                        animate={role === value ? { rotate: [0, 5, -5, 0] } : {}}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      >
                        <Icon size={14} className={`${role === value ? 'text-white' : 'text-gray-500'} transition-colors duration-300`} />
                      </motion.div>
                      <span className="hidden sm:inline">{label}</span>
                      <span className="sm:hidden">{value === 'hr' ? 'HR' : 'Emp'}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Enhanced Username Field */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <label htmlFor="username" className="block text-gray-700 font-semibold text-sm">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-200 group-focus-within:text-[#662b1f]">
                  <User size={18} className="text-gray-400 group-focus-within:text-[#662b1f]" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-gradient-to-r from-gray-50 to-white text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#662b1f]/20 focus:border-[#662b1f] transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
                  autoComplete="username"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#662b1f]/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
            </motion.div>

            {/* Enhanced Password Field */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-gray-700 font-semibold text-sm">
                  Password
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs sm:text-sm text-[#662b1f] hover:text-[#8a3b2d] font-semibold transition-colors duration-200 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-200 group-focus-within:text-[#662b1f]">
                  <Lock size={18} className="text-gray-400 group-focus-within:text-[#662b1f]" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-gradient-to-r from-gray-50 to-white text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl pl-12 pr-12 py-3.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#662b1f]/20 focus:border-[#662b1f] transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
                  autoComplete="current-password"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#662b1f] transition-colors duration-200"
                  tabIndex={-1}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </motion.button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#662b1f]/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
            </motion.div>

            {/* Enhanced Error Message */}
            {error && (
              <motion.div 
                className="bg-gradient-to-r from-red-50 to-rose-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-200/50 shadow-sm"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  {error}
                </div>
              </motion.div>
            )}

            {/* Enhanced Login Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#662b1f] via-[#8a3b2d] to-[#662b1f] hover:from-[#4e2118] hover:via-[#662b1f] hover:to-[#4e2118] text-white rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg shadow-[#662b1f]/25 hover:shadow-xl hover:shadow-[#662b1f]/30 flex items-center justify-center gap-2 relative overflow-hidden group"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {loading ? (
                <motion.div 
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  <span>Sign In</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.p 
            className="text-center text-gray-400 text-xs mt-8 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1 }}
          >
            <span>© {new Date().getFullYear()} Chateraise. All rights reserved.</span>
            <motion.div
              className="w-1 h-1 bg-gradient-to-r from-[#662b1f] to-pink-400 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default LoginPage;