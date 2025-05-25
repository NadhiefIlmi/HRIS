import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2,
  Save,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Shield,
} from 'lucide-react';

function ChangePasswordHR() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = () => {
    if (newPassword === '') {
      setError('Please enter a new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      setSuccessMessage('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
    }, 1500);
  };

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: '' };

    if (password.length < 8) {
      return { level: 1, text: 'Weak' };
    } else if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    ) {
      return { level: 3, text: 'Strong' };
    } else {
      return { level: 2, text: 'Medium' };
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] h-32 relative">
          <div className="absolute bottom-0 w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              className="w-full"
            >
              <path
                fill="#ffffff"
                fillOpacity="1"
                d="M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,176C672,171,768,181,864,176C960,171,1056,149,1152,149.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
          </div>
        </div>

        <div className="px-8 pb-8 pt-2 relative z-10">
          <div className="flex items-center mb-8">
            <div className="bg-[#662b1f] bg-opacity-10 p-3 rounded-xl mr-4">
              <Shield size={24} className="text-[#662b1f]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Change Password
              </h1>
              <p className="text-gray-500">
                Update your password to keep your account secure
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border-l-4 border-red-500 flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 border-l-4 border-green-500 flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 shadow-inner">
              <h3 className="text-lg font-semibold text-[#662b1f] mb-6">
                Password Information
              </h3>

              <div className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={16} className="text-gray-500" />
                    </div>
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#662b1f] focus:border-transparent"
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={16} className="text-gray-500" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#662b1f] focus:border-transparent"
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password strength */}
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500">
                          Password Strength:
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            passwordStrength.level === 1
                              ? 'text-red-500'
                              : passwordStrength.level === 2
                              ? 'text-yellow-500'
                              : 'text-green-500'
                          }`}
                        >
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            passwordStrength.level === 1
                              ? 'bg-red-500 w-1/3'
                              : passwordStrength.level === 2
                              ? 'bg-yellow-500 w-2/3'
                              : 'bg-green-500 w-full'
                          }`}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={16} className="text-gray-500" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-3 rounded-xl border ${
                        confirmPassword && newPassword !== confirmPassword
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-[#662b1f]'
                      } focus:outline-none focus:ring-2 focus:border-transparent`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">
                      Passwords don't match
                    </p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-between items-center mt-10">
                <button
                  type="button"
                  onClick={() => navigate(-1)} // back to previous page
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition font-medium"
                >
                  <ArrowLeft size={18} />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-3 bg-[#662b1f] text-white rounded-xl hover:bg-[#4e2118] transition font-medium shadow-md"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Password Tips */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Password Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use at least 8 characters</li>
                <li>• Include uppercase and lowercase letters</li>
                <li>• Add numbers and special characters</li>
                <li>• Avoid using personal information</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordHR;