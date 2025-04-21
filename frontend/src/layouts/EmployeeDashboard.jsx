import React from 'react';
import { useNavigate } from 'react-router-dom';

function EmployeeDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fefcfb] text-[#4a3b36] px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-[#e4dcd9] p-10 w-full max-w-xl text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome, {username}!</h1>
        <p className="text-gray-600 mb-6">This is your Employee Dashboard.</p>

        <div className="space-y-3">
          <button
            onClick={() => alert('Leave request feature coming soon!')}
            className="w-full py-3 bg-[#662b1f] hover:bg-[#4e2118] text-white rounded-lg font-semibold transition duration-300"
          >
            Request Leave
          </button>
          <button
            onClick={() => alert('View salary slip feature coming soon!')}
            className="w-full py-3 bg-[#a67b5b] hover:bg-[#8c6248] text-white rounded-lg font-semibold transition duration-300"
          >
            View Salary Slip
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-gray-300 hover:bg-gray-400 text-[#4a3b36] rounded-lg font-semibold transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
