import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ChevronRight, Lock, User, Calendar } from 'lucide-react';
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
  const navigate = useNavigate();

   useDocumentTitle("Login - Chateraise HR System");

  useEffect(() => {
    // Set current time on load
    setCurrentTime(new Date());
    
    // Update time every minute
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.8
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
    tap: { scale: 0.98 }
  };

  const logoVariants = {
    initial: { rotateY: 0 },
    animate: { 
      rotateY: 360,
      transition: { duration: 1.5, ease: "easeInOut" }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen font-sans bg-gray-50 overflow-hidden">
      {/* Left Side Image with Overlay */}
      <motion.div 
        className="w-full lg:w-3/5 h-1/3 lg:h-full relative overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.img
          src={SideImage}
          alt="Login Illustration"
          className="object-cover w-full h-full"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#662b1f]/80 to-[#662b1f]/40" />

        {/* Content overlay on image */}
        <motion.div 
          className="absolute inset-0 flex flex-col justify-between p-4 md:p-10 text-white"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <motion.div 
              className="flex items-center gap-2 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <Calendar size={18} className="text-white/80" />
              <span className="text-sm font-light">{formattedDate} • {formattedTime}</span>
            </motion.div>
            <motion.h1 
              className="text-3xl md:text-4xl font-bold mb-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              Welcome to Chateraise
            </motion.h1>
            <motion.p 
              className="bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent text-lg md:text-xl font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Employee Management System
            </motion.p>
          </motion.div>

          <motion.div 
            className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-xl w-full md:w-2/3 border border-white/20 shadow-lg"
            variants={itemVariants}
            whileHover={{ 
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              translateY: -3
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.p 
              className="text-lg font-medium mb-2"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
            >
              HR Management System
            </motion.p>
            <motion.p 
              className="opacity-90 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              Efficiently manage your workforce with our comprehensive HR solution.
              Track attendance, manage leave requests, and monitor employee performance.
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right Side Login Form */}
      <motion.div 
        className="w-full lg:w-2/5 h-2/3 lg:h-full flex items-center justify-center bg-white px-6 md:px-8 py-8 lg:py-0"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <motion.div 
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="text-center mb-8"
            variants={itemVariants}
          >
            <motion.div 
              className="flex justify-center items-center"
              variants={logoVariants}
              initial="initial"
              animate="animate"
              whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
            >
              <img src={ChateraiseLogo} alt="Chateraise Logo" className="h-16 md:h-20" />
            </motion.div>
            <motion.h2 
              className="text-2xl font-bold text-gray-800 mt-4"
              variants={itemVariants}
            >
              Sign in to your account
            </motion.h2>
          </motion.div>

          <motion.form 
            onSubmit={handleLogin} 
            className="space-y-4"
            variants={containerVariants}
          >
            {/* Role Selection */}
            <motion.div 
              className="flex justify-center mb-6"
              variants={itemVariants}
            >
              <motion.div 
                className="bg-gray-100 p-1 rounded-xl flex w-full max-w-xs"
                whileHover={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
              >
                {['hr', 'employee'].map((r) => (
                  <motion.button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg
                      ${role === r
                        ? 'bg-white text-[#662b1f] shadow-md'
                        : 'bg-transparent text-gray-600 hover:text-gray-800'}`}
                    whileHover={{ scale: role === r ? 1 : 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {r === 'hr' ? 'HR Manager' : 'Employee'}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>

            {/* Username Field */}
            <motion.div 
              className="space-y-2"
              variants={itemVariants}
            >
              <label htmlFor="username" className="block text-gray-700 font-medium text-sm">
                Username
              </label>
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <motion.input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#662b1f]/30 focus:border-[#662b1f] transition-all duration-200"
                  autoComplete="username"
                  whileFocus={{ boxShadow: "0 0 0 3px rgba(102, 43, 31, 0.1)" }}
                />
              </motion.div>
            </motion.div>

            {/* Password Field with Toggle */}
            <motion.div 
              className="space-y-2"
              variants={itemVariants}
            >
              <div className="flex justify-between">
                <label htmlFor="password" className="block text-gray-700 font-medium text-sm">
                  Password
                </label>
                <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.2 }}>
                  <Link to="/forgot-password" className="text-sm text-[#662b1f] hover:text-[#8a3b2d] font-medium">
                    Forgot password?
                  </Link>
                </motion.div>
              </div>
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <motion.input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-lg pl-11 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-[#662b1f]/30 focus:border-[#662b1f] transition-all duration-200"
                  autoComplete="current-password"
                  whileFocus={{ boxShadow: "0 0 0 3px rgba(102, 43, 31, 0.1)" }}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div 
                className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] hover:from-[#4e2118] hover:to-[#662b1f] text-white rounded-lg text-base font-medium transition-all duration-300 shadow-lg shadow-[#662b1f]/20 flex items-center justify-center gap-2"
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              {loading ? (
                <motion.div 
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  Sign In <ChevronRight size={16} />
                </>
              )}
            </motion.button>

            <motion.div 
              className="bg-gray-50 rounded-xl p-4 mt-8 border border-gray-100"
              variants={itemVariants}
              whileHover={{ 
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                y: -2
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.p 
                className="text-center text-gray-600 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                {role === 'hr' ?
                  "Access the HR dashboard to manage employees, track attendance, and process leave requests." :
                  "Sign in to view your schedule, submit leave requests, and access your performance reports."
                }
              </motion.p>
            </motion.div>
          </motion.form>

          <motion.p 
            className="text-center text-gray-500 text-xs mt-8"
            variants={itemVariants}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            © {new Date().getFullYear()} Chateraise. All rights reserved.
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default LoginPage;