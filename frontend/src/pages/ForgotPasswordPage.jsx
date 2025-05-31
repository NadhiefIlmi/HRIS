import React, { useState } from 'react';
import API from '../api/api';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useDocumentTitle from "../hooks/useDocumentTitle";

function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

   useDocumentTitle("Forgot Password");

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
    <div className="flex items-center justify-center h-screen bg-[#fefcfb] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-[#e4dcd9]">
        <h2 className="text-2xl font-semibold text-center text-[#4a3b36] mb-6">
          {step === 1 ? 'Forgot Password' : 'Reset Password'}
        </h2>

        <form onSubmit={step === 1 ? handleRequestOTP : handleResetPassword} className="space-y-4">
          {/* Step 1: Request OTP */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm text-[#4a3b36] mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-[#d6c5bd] rounded-lg bg-gray-100 focus:ring-2 focus:ring-[#662b1f]/70 outline-none"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#4a3b36] mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-[#d6c5bd] rounded-lg bg-gray-100 focus:ring-2 focus:ring-[#662b1f]/70 outline-none"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </>
          )}

          {/* Step 2: Reset Password */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm text-[#4a3b36] mb-1">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 border border-[#d6c5bd] rounded-lg bg-gray-100 focus:ring-2 focus:ring-[#662b1f]/70 outline-none"
                  placeholder="Enter the OTP sent to your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#4a3b36] mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-[#d6c5bd] rounded-lg bg-gray-100 focus:ring-2 focus:ring-[#662b1f]/70 outline-none"
                  placeholder="Enter new password"
                  required
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#662b1f] hover:bg-[#4e2118] text-white py-3 rounded-lg font-medium transition duration-300"
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {step === 1 ? 'Request OTP' : 'Reset Password'}
          </button>

          {/* Info/Error Message */}
          {message && <p className="text-green-600 text-center">{message}</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}

          <div className="text-center">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-800">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;