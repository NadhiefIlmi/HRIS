import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, ArrowRight, Check, X, CalendarDays, File, GraduationCap,
  ClipboardList, Briefcase, TrendingUp, User
} from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/api';

function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchAttendanceStatus();
    const interval = setInterval(() => setCurrentTime(new Date()), 60000); // Update setiap 1 menit
    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/employee/me');
      setEmployee(res.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const res = await API.get('/api/employee/attendance/today');
      setAttendanceStatus(res.data);
    } catch (err) {
      console.error('Failed to get attendance status:', err);
    }
  };

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      await API.post('/api/employee/check-in');
      fetchAttendanceStatus();
      showNotification('Success', 'Checked in successfully!', 'success');
    } catch (err) {
      showNotification('Error', err.response?.data?.message || 'Failed to check in', 'error');
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckOutLoading(true);
    try {
      await API.post('/api/employee/check-out');
      fetchAttendanceStatus();
      showNotification('Success', 'Checked out successfully!', 'success');
    } catch (err) {
      showNotification('Error', err.response?.data?.message || 'Failed to check out', 'error');
    } finally {
      setCheckOutLoading(false);
    }
  };

  const formatTime = (date) => date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const showNotification = (title, message) => {
    alert(`${title}: ${message}`);
  };

  // Animasi
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  const QuickAccessCard = ({ icon: Icon, title, description, link, color }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
    >
      <Link 
        to={link} 
        className="bg-white rounded-xl p-6 shadow-md border border-[#f0e8e4] flex flex-col h-full relative"
      >
        <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center mb-4`}>
          <Icon size={22} className="text-white" />
        </div>
        <h3 className="font-semibold text-gray-800 mb-2 text-lg">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        <div className="flex items-center text-[#662b1f] font-medium">
          <span>View details</span>
          <ArrowRight size={16} className="ml-2" />
        </div>
      </Link>
    </motion.div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-4 md:p-6 space-y-6 bg-[#f9f9f9] min-h-screen"
    >
      {/* Header Section */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {getGreeting()}, 
            <span className="text-[#662b1f] ml-2">
              {loading ? '...' : employee?.username || 'Employee'}
            </span>
          </h1>
          <p className="text-gray-500 mt-1">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Clock size={18} className="text-[#662b1f]" />
          <motion.div
            key={currentTime.getMinutes()}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-medium text-gray-700"
          >
            {formatTime(currentTime)}
          </motion.div>
        </div>
      </motion.div>

      {/* Attendance Section */}
      <motion.div variants={itemVariants}>
        <div className="bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock size={20} />
                Daily Attendance
              </h2>
              {attendanceStatus && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span>Check In:</span>
                    <span className="font-medium">
                      {attendanceStatus.checkIn 
                        ? formatDate(attendanceStatus.checkIn)
                        : 'Not checked in'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Check Out:</span>
                    <span className="font-medium">
                      {attendanceStatus.checkOut 
                        ? formatDate(attendanceStatus.checkOut)
                        : 'Not checked out'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button
                onClick={handleCheckIn}
                disabled={checkInLoading || attendanceStatus?.checkIn}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium ${
                  attendanceStatus?.checkIn
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-white text-[#662b1f] hover:bg-gray-100'
                }`}
              >
                <Check size={18} />
                {checkInLoading ? 'Processing...' : 'Check In'}
              </button>

              <button
                onClick={handleCheckOut}
                disabled={checkOutLoading || !attendanceStatus?.checkIn || attendanceStatus?.checkOut}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium ${
                  !attendanceStatus?.checkIn || attendanceStatus?.checkOut
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-white text-[#662b1f] hover:bg-gray-100'
                }`}
              >
                <X size={18} />
                {checkOutLoading ? 'Processing...' : 'Check Out'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Access Grid */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAccessCard 
            icon={CalendarDays}
            title="Leave Permission"
            description="Request time off"
            link="/employee/leave"
            color="bg-blue-500"
          />
          <QuickAccessCard 
            icon={File}
            title="Salary Slip"
            description="View salary details"
            link="/employee/salary-slip"
            color="bg-green-500"
          />
          <QuickAccessCard 
            icon={GraduationCap}
            title="Education"
            description="Manage education history"
            link="/employee/education"
            color="bg-purple-500"
          />
          <QuickAccessCard 
            icon={ClipboardList}
            title="Training"
            description="Professional development"
            link="/employee/training"
            color="bg-yellow-500"
          />
          <QuickAccessCard 
            icon={Briefcase}
            title="Attendance"
            description="View history"
            link="/employee/attendance"
            color="bg-indigo-500"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default EmployeeDashboard;