import React, { useState } from "react";
import { Loader2, Save, ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";

export default function ChangePasswordEmployee() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirmation do not match");
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setSuccessMessage("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setLoading(false);
    }, 1500);
  };

  const togglePasswordVisibility = (field) => {
    if (field === "old") setShowOldPassword(!showOldPassword);
    if (field === "new") setShowNewPassword(!showNewPassword);
    if (field === "confirm") setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#662b1f] to-[#8a3b2a] p-10">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-full">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white ml-4">Change Password</h1>
            </div>
            <p className="text-white/80 mt-2 text-lg">Update your password to keep your account secure</p>
          </div>

          <div className="p-10 space-y-8">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Old password */}
              <div>
                <label className="block text-gray-700 font-medium text-base mb-2">Old Password</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border border-gray-300 pr-12 text-base"
                    placeholder="Enter your current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("old")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#662b1f]"
                  >
                    {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-gray-700 font-medium text-base mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border border-gray-300 pr-12 text-base"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#662b1f]"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-gray-700 font-medium text-base mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border border-gray-300 pr-12 text-base"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#662b1f]"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Strength indicator */}
              <div className="pt-2">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      newPassword.length > 8
                        ? "bg-green-500"
                        : newPassword.length > 4
                        ? "bg-yellow-500"
                        : newPassword.length > 0
                        ? "bg-red-500"
                        : "bg-gray-200"
                    }`}
                    style={{ width: `${Math.min(100, newPassword.length * 10)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Password strength:{" "}
                  {newPassword.length > 8
                    ? "Strong"
                    : newPassword.length > 4
                    ? "Medium"
                    : newPassword.length > 0
                    ? "Weak"
                    : "None"}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-6 py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition flex items-center gap-2 text-base font-medium"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#662b1f] text-white rounded-xl hover:bg-[#4e2118] transition flex items-center gap-2 text-base font-medium shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">Need help? Contact IT Support</p>
      </div>
    </div>
  );
}