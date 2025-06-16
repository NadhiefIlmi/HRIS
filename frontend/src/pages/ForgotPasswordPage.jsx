import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Loader2, 
  Calendar, 
  KeyRound, 
  User, 
  Mail, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import { motion } from 'framer-motion';
import useDocumentTitle from "../hooks/useDocumentTitle";
import ChateraiseLogo from '../assets/Chateraise1.png';
import SideImage from '../assets/image.jpg';

// Error Boundary untuk menangkap error di komponen
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary caught:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <h2 className="font-bold">Something went wrong</h2>
          <p>Please try again later or contact support</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Variants untuk animasi
const slideVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

const formVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');
  const [formattedTime, setFormattedTime] = useState('');
  const navigate = useNavigate();

  useDocumentTitle("Forgot Password");

  // Inisialisasi gambar placeholder

  // Format tanggal dan waktu
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setFormattedDate(now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
      setFormattedTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await API.post('/request-reset-password', { username, email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mengirim OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await API.post('/reset-password', { username, otp, newPassword });
      setMessage(res.data.message);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
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
            alt="Forgot Password Illustration"
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
                  Reset Your Password
                </h1>
                <div className="flex items-center gap-2">
                  <KeyRound size={18} className="text-pink-300" />
                  <p className="bg-gradient-to-r from-pink-200 via-white to-pink-200 bg-clip-text text-transparent text-sm sm:text-base md:text-lg lg:text-xl font-medium">
                    Secure Account Recovery
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
                  <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full animate-pulse" />
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-white">
                    Password Recovery Process
                  </p>
                </div>
                <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
                  {step === 1 
                    ? "Enter your username and email to receive a verification code."
                    : "Enter the verification code and your new password to complete the reset."
                  }
                  <span className="hidden sm:inline"> Your account security is our priority.</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Side Form */}
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
                className="flex justify-center items-center relative mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <img src={ChateraiseLogo} alt="Chateraise Logo" className="h-12 sm:h-14 md:h-16 relative z-10" />
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

              {/* Step Indicator */}
              <motion.div 
                className="flex items-center justify-center gap-2 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    step >= 1 ? 'bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] text-white shadow-lg' : 'bg-gray-200 text-gray-500'
                  }`}>
                    1
                  </div>
                  <div className={`w-8 h-1 rounded-full transition-all duration-300 ${
                    step >= 2 ? 'bg-gradient-to-r from-[#662b1f] to-[#8a3b2d]' : 'bg-gray-200'
                  }`} />
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    step >= 2 ? 'bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] text-white shadow-lg' : 'bg-gray-200 text-gray-500'
                  }`}>
                    2
                  </div>
                </div>
              </motion.div>

              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 via-[#662b1f] to-gray-800 bg-clip-text text-transparent">
                {step === 1 ? 'Reset Password' : 'Set New Password'}
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                {step === 1 
                  ? 'Enter your account details to receive verification code'
                  : 'Enter verification code and your new password'
                }
              </p>
            </motion.div>

            <motion.form 
              onSubmit={step === 1 ? handleRequestOTP : handleResetPassword} 
              className="space-y-4 sm:space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* Step 1: Request OTP */}
              {step === 1 && (
                <>
                  {/* Username Field */}
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
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
                        required
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#662b1f]/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
                    </div>
                  </motion.div>

                  {/* Email Field */}
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <label htmlFor="email" className="block text-gray-700 font-semibold text-sm">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-200 group-focus-within:text-[#662b1f]">
                        <Mail size={18} className="text-gray-400 group-focus-within:text-[#662b1f]" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full bg-gradient-to-r from-gray-50 to-white text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#662b1f]/20 focus:border-[#662b1f] transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
                        required
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#662b1f]/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
                    </div>
                  </motion.div>
                </>
              )}

              {/* Step 2: Reset Password */}
              {step === 2 && (
                <>
                  {/* OTP Field */}
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    <label htmlFor="otp" className="block text-gray-700 font-semibold text-sm">
                      Verification Code (OTP)
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-200 group-focus-within:text-[#662b1f]">
                        <Shield size={18} className="text-gray-400 group-focus-within:text-[#662b1f]" />
                      </div>
                      <input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit verification code"
                        className="w-full bg-gradient-to-r from-gray-50 to-white text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#662b1f]/20 focus:border-[#662b1f] transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg tracking-widest"
                        maxLength={6}
                        required
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#662b1f]/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
                    </div>
                  </motion.div>

                  {/* New Password Field */}
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <label htmlFor="newPassword" className="block text-gray-700 font-semibold text-sm">
                      New Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-200 group-focus-within:text-[#662b1f]">
                        <Lock size={18} className="text-gray-400 group-focus-within:text-[#662b1f]" />
                      </div>
                      <input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        className="w-full bg-gradient-to-r from-gray-50 to-white text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl pl-12 pr-12 py-3.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#662b1f]/20 focus:border-[#662b1f] transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
                        required
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
                </>
              )}

              {/* Success Message */}
              {message && (
                <motion.div 
                  className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 px-4 py-3 rounded-xl text-sm border border-green-200/50 shadow-sm"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    {message}
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
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

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#662b1f] via-[#8a3b2d] to-[#662b1f] hover:from-[#4e2118] hover:via-[#662b1f] hover:to-[#4e2118] text-white rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg shadow-[#662b1f]/25 hover:shadow-xl hover:shadow-[#662b1f]/30 flex items-center justify-center gap-2 relative overflow-hidden group"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
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
                    <span>{step === 1 ? 'Send Verification Code' : 'Reset Password'}</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </motion.button>

              {/* Back to Login Link */}
              <motion.div 
                className="text-center pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <Link 
                  to="/"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#662b1f] font-semibold transition-all duration-200 hover:gap-3 group"
                >
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
                  <span>Back to Login</span>
                </Link>
              </motion.div>
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
    </ErrorBoundary>
  );
}

export default ForgotPasswordPage;