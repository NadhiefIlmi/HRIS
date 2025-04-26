import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ChevronRight, Lock, User } from 'lucide-react';
import API from '../api/api';
import ChateraiseLogo from '../assets/Chateraise1.png';
import SideImage from '../assets/image.jpg';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('hr');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    // Set current time on load
    setCurrentTime(new Date());
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

  return (
    <div className="flex h-screen w-screen font-sans bg-gray-50">
      {/* Left Side Image with Overlay */}
      <div className="w-3/5 h-full hidden lg:block relative overflow-hidden">
        <img
          src={SideImage}
          alt="Login Illustration"
          className="object-cover w-full h-full scale-105 hover:scale-110 transition-transform duration-10000"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#662b1f]/80 to-[#662b1f]/40" />

        {/* Content overlay on image */}
        <div className="absolute inset-0 flex flex-col justify-between p-10 text-white">
          <div>
            <h1 className="text-4xl font-bold mb-3">Welcome to Chateraise</h1>
            <p className="text-xl opacity-90 max-w-lg">
              Employee Management System
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl w-2/3 border border-white/20">
            <p className="text-lg font-medium mb-2">HR Management System</p>
            <p className="opacity-80 text-sm">
              Efficiently manage your workforce with our comprehensive HR solution.
              Track attendance, manage leave requests, and monitor employee performance.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side Login Form */}
      <div className="w-full lg:w-2/5 h-full flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <div className="flex justify-center items-center">
              <img src={ChateraiseLogo} alt="Chateraise Logo" className="h-20" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">Sign in to your account</h2>
          </div>


          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Selection */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 p-1 rounded-xl flex w-full max-w-xs">
                {['hr', 'employee'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg
                      ${role === r
                        ? 'bg-white text-[#662b1f] shadow-md'
                        : 'bg-transparent text-gray-600 hover:text-gray-800'}`}
                  >
                    {r === 'hr' ? 'HR Manager' : 'Employee'}
                  </button>
                ))}
              </div>
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-gray-700 font-medium text-sm">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#662b1f]/30 focus:border-[#662b1f] transition-all duration-200"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field with Toggle */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="password" className="block text-gray-700 font-medium text-sm">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-[#662b1f] hover:text-[#8a3b2d] font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-lg pl-11 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-[#662b1f]/30 focus:border-[#662b1f] transition-all duration-200"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] hover:from-[#4e2118] hover:to-[#662b1f] text-white rounded-lg text-base font-medium transition-all duration-300 shadow-lg shadow-[#662b1f]/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ChevronRight size={16} />
                </>
              )}
            </button>

            <div className="bg-gray-50 rounded-xl p-4 mt-8 border border-gray-100">
              <p className="text-center text-gray-600 text-sm">
                {role === 'hr' ?
                  "Access the HR dashboard to manage employees, track attendance, and process leave requests." :
                  "Sign in to view your schedule, submit leave requests, and access your performance reports."
                }
              </p>
            </div>
          </form>

          <p className="text-center text-gray-500 text-xs mt-8">
            © {new Date().getFullYear()} Chateraise. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;