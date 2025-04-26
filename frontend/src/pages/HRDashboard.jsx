import React, { useEffect, useState } from 'react';
import { UserCircle, CalendarCheck2, UploadCloud, AlertCircle, ChevronRight, Bell, Users, ChevronDown, Menu, PieChart as PieChartIcon } from 'lucide-react';
import API from '../api/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

function HRDashboard() {
  const [totalEmployees, setTotalEmployees] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(null);
  const [employeesError, setEmployeesError] = useState(false);
  const [pendingError, setPendingError] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [genderData, setGenderData] = useState([]);
  const [genderError, setGenderError] = useState(false);
  const [departmentData, setDepartmentData] = useState([
    { name: 'Engineering', value: 42, color: '#4F46E5' },
    { name: 'Marketing', value: 28, color: '#10B981' },
    { name: 'Finance', value: 15, color: '#F59E0B' },
    { name: 'HR', value: 8, color: '#EC4899' }
  ]);

  useEffect(() => {
    const fetchGenderData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await API.get('/api/hr/gender-summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGenderData([
          { name: 'Male', value: res.data.male, color: '#6366F1' },
          { name: 'Female', value: res.data.female, color: '#F472B6' },
        ]);
        setGenderError(false);
      } catch (err) {
        console.error('Error fetching gender data:', err);
        setGenderError(true);
      }
    };

    fetchGenderData();
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');

      try {
        const employeesResponse = await API.get('/api/hr/count-employees', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTotalEmployees(employeesResponse.data?.totalEmployees ?? 0);
        setEmployeesError(false);
      } catch (error) {
        console.error('Error fetching total employees:', error);
        setEmployeesError(true);
      }

      try {
        const pendingResponse = await API.get('/api/hr/count-pending-leaves', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingRequests(pendingResponse.data?.totalPendingRequests ?? 0);
        setPendingError(false);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
        setPendingError(true);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const username = localStorage.getItem('username') || 'HR Manager';
  const capitalizedName = username.charAt(0).toUpperCase() + username.slice(1);

  const quickActions = [
    { icon: <Users size={18} />, label: 'Add Employee', link: '/employees/add' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              <span className="text-[#662b1f]">{greeting},</span> {capitalizedName}
            </h1>
            <p className="text-gray-600 mt-1">Welcome to your HR management dashboard </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.link}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 text-sm font-medium"
              >
                {action.icon}
                {action.label}
              </a>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={employeesError ? <AlertCircle /> : <UserCircle />}
            count={employeesError ? "Error" : (totalEmployees === null ? "Loading..." : totalEmployees)}
            label="Total Employees"
            color="bg-indigo-50"
            iconColor="text-indigo-600"
            loading={loading}
            link="/employees"
          />
          <StatCard
            icon={pendingError ? <AlertCircle /> : <CalendarCheck2 />}
            count={pendingError ? "Error" : (pendingRequests === null ? "Loading..." : pendingRequests)}
            label="Pending Leave Requests"
            color="bg-amber-50"
            iconColor="text-amber-600"
            loading={loading}
            link="/leave-requests"
          />
          <StatCard
            
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Enhanced Gender Distribution Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Gender Distribution</h3>
              <div className="flex gap-2">
                <button className="p-1 rounded-md hover:bg-gray-100">
                  <ChevronDown size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            {genderError ? (
              <div className="flex items-center justify-center h-64 bg-red-50 rounded-xl text-red-500">
                <AlertCircle className="mr-2" size={20} />
                Failed to load gender data
              </div>
            ) : genderData.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-t-[#662b1f] border-gray-200 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={5}
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} employees`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="flex flex-col gap-3 mt-4 md:mt-0">
                  {genderData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                      <span className="text-sm text-gray-700">{entry.name}: {entry.value} employees</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Department Distribution Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Department Distribution (bakal dibuat) </h3>
              <div className="flex gap-2">
                <button className="p-1 rounded-md hover:bg-gray-100">
                  <ChevronDown size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={5}
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} employees`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="flex flex-col gap-3 mt-4 md:mt-0">
                {departmentData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-sm text-gray-700">{entry.name}: {entry.value} employees</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity and Announcements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Recent Activity (Bakal Dibuat) </h2>
              <a href="/activities" className="text-sm text-[#662b1f] hover:underline font-medium flex items-center">
                View all <ChevronRight size={16} className="ml-1" />
              </a>
            </div>
            <div className="p-6">
              {/* Activity items */}
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <UserCircle size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">John Doe submitted a leave request</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Announcements (Bakal dibuat)</h2>
              <button className="text-white bg-[#662b1f] hover:bg-[#4e2118] px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                New Announcement
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="p-5 rounded-xl bg-gradient-to-r from-[#662b1f]/10 to-[#662b1f]/5 border border-[#662b1f]/20 hover:shadow-md transition-shadow duration-300">
                <h4 className="font-semibold text-[#662b1f]">Company Meeting</h4>
                <p className="text-gray-700 text-sm mt-2">Monthly company meeting this Friday at 3:00 PM in the main conference room.</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-500">Posted on April 24, 2025</span>
                  <button className="text-[#662b1f] hover:text-[#4e2118] text-sm font-medium">Edit</button>
                </div>
              </div>
              
              <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200/30 hover:shadow-md transition-shadow duration-300">
                <h4 className="font-semibold text-blue-600">New Office Policy</h4>
                <p className="text-gray-700 text-sm mt-2">Updated remote work guidelines are now available in the employee handbook.</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-500">Posted on April 22, 2025</span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, count, label, color, iconColor, loading, link }) {
  return (
    <a
      href={link}
      className="block p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent rounded-full -mt-16 -mr-16 opacity-70"></div>

      <div className="flex items-center gap-6 relative z-10">
        <div className={`p-4 rounded-xl ${color} ${iconColor}`}>
          {icon}
        </div>

        <div>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <div className="text-3xl font-bold text-gray-800">{count}</div>
          )}
          <div className="text-sm text-gray-500 mt-1">{label}</div>
        </div>
      </div>

      <div className="absolute top-4 right-4 group-hover:translate-x-1 transition-transform duration-300">
        <ChevronRight size={20} className="text-gray-300 group-hover:text-[#662b1f]" />
      </div>
    </a>
  );
}

export default HRDashboard;