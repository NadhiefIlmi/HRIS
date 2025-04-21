import React from 'react';
import { UserCircle, CalendarCheck2, UploadCloud } from 'lucide-react';

function HRDashboard() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#662b1f] tracking-tight">Welcome back, HR Manager</h1>
        <p className="text-gray-600 mt-2 text-lg">Let's manage your team effectively today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<UserCircle size={28} />}
          count="12"
          label="Employees"
          color="bg-[#fdf2f1]"
        />
        <StatCard 
          icon={<CalendarCheck2 size={28} />}
          count="3"
          label="Pending Requests"
          color="bg-[#fef3e8]"
        />
        <StatCard 
          icon={<UploadCloud size={28} />}
          count="8"
          label="Recent Uploads"
          color="bg-[#edf7f6]"
        />
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-semibold text-[#662b1f] mb-4">Recent Activity</h2>
        <div className="bg-white border border-[#e4dcd9] rounded-2xl shadow-sm hover:shadow-md transition p-8 text-center">
          <CalendarCheck2 size={48} className="text-[#c1b4b0] mx-auto mb-4" />
          <h4 className="text-gray-800 font-semibold mb-1 text-lg">No recent activity</h4>
          <p className="text-gray-500 text-sm">Activities will appear here as they happen.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, count, label, color }) {
  return (
    <div className={`p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-300 bg-white`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${color} text-[#662b1f]`}>
          {icon}
        </div>
        <div>
          <div className="text-3xl font-bold text-[#662b1f]">{count}</div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default HRDashboard;
