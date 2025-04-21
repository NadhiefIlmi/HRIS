import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import ChateraiseLogo from '../assets/Chateraise1.png';
import SideImage from '../assets/image.jpg';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('hr');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = role === 'hr' ? '/api/hr/login' : '/api/employee/login';
    try {
      const response = await API.post(endpoint, { username, password });
      const token = response.data.token;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);

      if (role === 'hr') {
        navigate('/dashboard');
      } else {
        navigate('/employee-dashboard'); // Ganti ke employee-dashboard
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex h-screen w-screen font-sans bg-[#fefcfb]">
      {/* Kiri: Gambar */}
      <div className="w-1/2 h-full hidden md:block relative">
        <img
          src={SideImage}
          alt="Login Illustration"
          className="object-cover w-full h-full brightness-95"
        />
        <div className="absolute inset-0 bg-[#662b1f]/30 backdrop-blur-sm" />
      </div>

      {/* Kanan: Form Login */}
      <div className="w-full md:w-1/2 h-full flex items-center justify-center bg-[#fefcfb] px-6">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl border border-[#e4dcd9]">
          <div className="flex justify-center mb-4">
            <img src={ChateraiseLogo} alt="Chateraise Logo" className="h-24" />
          </div>

          <p className="text-center text-gray-600 mb-8 text-sm">
            Login to your account to continue
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Pilihan Role */}
            <div className="flex justify-center mb-4">
              <button
                type="button"
                onClick={() => setRole('hr')}
                className={`px-4 py-2 rounded-l-lg border border-[#d6c5bd] text-sm font-medium transition duration-200 ${
                  role === 'hr' ? 'bg-[#662b1f] text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                HR
              </button>
              <button
                type="button"
                onClick={() => setRole('employee')}
                className={`px-4 py-2 rounded-r-lg border border-[#d6c5bd] text-sm font-medium transition duration-200 ${
                  role === 'employee' ? 'bg-[#662b1f] text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Employee
              </button>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-[#4a3b36] mb-2 font-medium">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full bg-gray-100 bg-opacity-60 text-gray-700 placeholder-gray-400 border border-[#d6c5bd] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#662b1f]/70 transition duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[#4a3b36] mb-2 font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-gray-100 bg-opacity-60 text-gray-700 placeholder-gray-400 border border-[#d6c5bd] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#662b1f]/70 transition duration-200"
              />
            </div>

            {/* Tombol Login */}
            <button
              type="submit"
              className="w-full py-3 bg-[#662b1f] hover:bg-[#4e2118] text-white rounded-lg text-lg font-semibold transition duration-300"
            >
              Login
            </button>

            {/* Error */}
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
