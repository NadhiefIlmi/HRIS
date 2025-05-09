import React, { useEffect, useState } from 'react';
import { 
  UserCircle, 
  CalendarCheck2, 
  AlertCircle, 
  ChevronRight,
  Users, 
  Briefcase,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import API from '../api/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function HRDashboard() {
  const [totalEmployees, setTotalEmployees] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(null);
  const [employeesError, setEmployeesError] = useState(false);
  const [pendingError, setPendingError] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [genderError, setGenderError] = useState(false);

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
    
    // Set up calendar data
    const date = new Date();
    setCurrentMonth(date.toLocaleString('default', { month: 'long' }));
    setCurrentYear(date.getFullYear());
    
    // Generate days for the current month
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    
    // Create array for days in month with padding for first day
    const days = [];
    
    // Add empty slots for days before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', isCurrentDay: false });
    }
    
    // Add all days in the month
    for (let i = 1; i <= lastDate; i++) {
      days.push({ 
        day: i, 
        isCurrentDay: i === date.getDate() 
      });
    }
    
    setDaysInMonth(days);
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
    <div className="min-h-screen">
      {/* Welcome Header with Glass Effect */}
      <div className="relative overflow-hidden rounded-3xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#662b1f]/10 to-[#8a3b2d]/5 backdrop-blur-sm z-0"></div>
        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#662b1f]/10 text-[#662b1f] rounded-full text-sm font-medium mb-4">
                <Sparkles size={16} className="animate-pulse" />
                <span>{currentDate}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex flex-col md:flex-row md:items-center gap-2">
                <span className="text-[#662b1f]">{greeting},</span>
                <span>{capitalizedName}</span>
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Welcome to your HR management dashboard</p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 self-start">
              {quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.link}
                  className="flex items-center gap-2 bg-white hover:bg-[#662b1f] hover:text-white text-[#662b1f] px-5 py-2.5 rounded-xl border border-[#662b1f]/20 shadow-sm transition-all duration-300 text-sm font-medium group"
                >
                  <span className="group-hover:scale-110 transition-transform duration-300">{action.icon}</span>
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={employeesError ? <AlertCircle size={50} /> : <UserCircle size={50} />}
          count={employeesError ? "Error" : (totalEmployees === null ? "Loading..." : totalEmployees)}
          label="Total Employees"
          color="bg-gradient-to-br from-indigo-50 to-indigo-100"
          iconColor="text-indigo-600"
          loading={loading}
          link="/employees"
          iconBg="bg-indigo-500/10"
          accentColor="border-indigo-500"
        />
        <StatCard
          icon={pendingError ? <AlertCircle size={50} /> : <CalendarCheck2 size={50} />}
          count={pendingError ? "Error" : (pendingRequests === null ? "Loading..." : pendingRequests)}
          label="Pending Leave Requests"
          color="bg-gradient-to-br from-amber-50 to-amber-100"
          iconColor="text-amber-600"
          loading={loading}
          link="/leave-requests"
          iconBg="bg-amber-500/10"
          accentColor="border-amber-500"
        />
        <CalendarStatCard 
          currentMonth={currentMonth}
          currentYear={currentYear}
          daysInMonth={daysInMonth}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enhanced Gender Distribution Chart */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#662b1f]/5 to-transparent rounded-full -mt-20 -mr-20"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-100/50 text-indigo-600">
                <Users size={22} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Gender Distribution</h3>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Employee Data
            </span>
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
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="w-full md:w-1/2">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                      paddingAngle={5}
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} employees`, 'Count']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        padding: '0.75rem'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-4 mt-4 md:mt-0 w-full md:w-1/2">
                {genderData.map((entry, index) => (
                  <div key={index} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-3 h-10 rounded-l-lg mr-3" style={{ backgroundColor: entry.color }}></div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-800">{entry.value}</span>
                        <span className="text-xs text-gray-500">employees</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, count, label, color, iconColor, loading, link, iconBg, accentColor }) {
  return (
    <a
      href={link}
      className={`block p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden hover:border-l-4 ${accentColor}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent rounded-full -mt-16 -mr-16 opacity-70"></div>

      <div className="flex items-start gap-5 relative z-10">
        {/* Icon */}
        <div className={`p-4 rounded-2xl ${iconBg} ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>

        <div className="flex-1">
          {/* Label */}
          <div className="text-sm font-medium text-gray-500 mb-2">
            {label}
          </div>
          
          {/* Count */}
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <div className="text-3xl font-bold text-gray-800">{count}</div>
          )}
          
          <div className="mt-4 flex items-center text-xs text-[#662b1f] font-medium">
            <span>View details</span>
            <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </a>
  );
}

function CalendarStatCard({ currentMonth, currentYear, daysInMonth, link }) {
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  return (
    <div className="block p-6 rounded-3xl bg-gradient-to-br from-gray-900 to-[#662b1f] border border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBmaWxsPSIjMDAwMDAwIiBmaWxsLW9wYWNpdHk9Ii4wNSIgZD0iTTYwIDBoLTRWNGg0VjB6TTAgMGg0djRIMFYwem0wIDU2aDR2NEgwdi00em01NiAwaDR2NGgtNHYtNHoiLz48L2c+PC9zdmc+')]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <CalendarCheck2 size={22} />
            </div>
            <h3 className="text-lg font-semibold text-white">{currentMonth} {currentYear}</h3>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-xs text-blue-100">Today</span>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mt-3">
          {/* Calendar header with weekdays */}
          {weekdays.map((day, index) => (
            <div key={index} className="h-8 flex items-center justify-center">
              <span className="text-blue-300 text-xs font-medium">{day}</span>
            </div>
          ))}
          
          {/* Calendar days */}
          {daysInMonth.map((dayObj, index) => (
            <div 
              key={index} 
              className={`h-9 flex items-center justify-center rounded-lg ${
                dayObj.isCurrentDay 
                  ? 'bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/30' 
                  : dayObj.day 
                    ? 'text-gray-300 hover:bg-white/10 transition-colors cursor-pointer' 
                    : ''
              }`}
            >
              <span className="text-sm">{dayObj.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HRDashboard;