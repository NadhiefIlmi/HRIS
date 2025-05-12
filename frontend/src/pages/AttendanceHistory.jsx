import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import API from '../api/api';

const AttendanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      const res = await API.get('/api/employee/attendance/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return dateString ? new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    }) : '-';
  };

  const getWorkStatus = (record) => {
    if (!record.checkOut) return 'ongoing';
    const hours = parseFloat(record.workHours);
    return hours >= 8 ? 'complete' : 'partial';
  };

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(record => getWorkStatus(record) === filter);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 border-b border-[#f0e8e4] pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] p-3 rounded-xl">
            <CalendarDays size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#662b1f]">Attendance History</h2>
            <p className="text-sm text-gray-500">Track your attendance and work hours</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
              filter === 'all' 
                ? 'bg-[#662b1f] text-white' 
                : 'bg-[#fdf6f3] text-[#662b1f] hover:bg-[#f0e8e4]'
            }`}
          >
            All
          </button>
          
          <button 
            onClick={() => setFilter('complete')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
              filter === 'complete' 
                ? 'bg-[#662b1f] text-white' 
                : 'bg-[#fdf6f3] text-[#662b1f] hover:bg-[#f0e8e4]'
            }`}
          >
            Complete
          </button>
          
          <button 
            onClick={() => setFilter('partial')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
              filter === 'partial' 
                ? 'bg-[#662b1f] text-white' 
                : 'bg-[#fdf6f3] text-[#662b1f] hover:bg-[#f0e8e4]'
            }`}
          >
            Partial
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#662b1f]"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 bg-[#fdf6f3] rounded-xl border border-dashed border-[#f0e8e4]">
          <CalendarDays size={48} className="text-[#8a3b2d]/30 mx-auto mb-3" />
          <p className="text-gray-500">No attendance records found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#f0e8e4]">
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-[#fdf6f3] text-[#662b1f]">
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Check In</th>
                  <th className="px-4 py-3 text-left font-semibold">Check Out</th>
                  <th className="px-4 py-3 text-left font-semibold">Work Hours</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e8e4]">
                {filteredHistory.map((record, index) => {
                  const status = getWorkStatus(record);
                  return (
                    <tr key={index} className="hover:bg-[#fdf6f3] transition-colors duration-200">
                      <td className="px-4 py-3 font-medium text-gray-700">{formatDate(record.checkIn)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex items-center">
                          <Clock size={16} className="mr-1 text-[#662b1f]" />
                          {formatTime(record.checkIn)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {record.checkOut ? (
                          <div className="flex items-center">
                            <Clock size={16} className="mr-1 text-[#662b1f]" />
                            {formatTime(record.checkOut)}
                          </div>
                        ) : (
                          <span className="text-blue-500 font-medium">In Progress</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {record.workHours || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {status === 'complete' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 size={14} className="mr-1" /> Complete
                          </span>
                        )}
                        {status === 'partial' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <AlertCircle size={14} className="mr-1" /> Partial
                          </span>
                        )}
                        {status === 'ongoing' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Clock size={14} className="mr-1" /> Ongoing
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 text-right text-sm text-gray-500">
        {history.length > 0 && (
          <p>Showing {filteredHistory.length} of {history.length} records</p>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-[#f0e8e4]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#fdf6f3] p-4 rounded-xl border border-[#f0e8e4]">
            <div className="font-semibold text-[#662b1f] mb-1">Total Days</div>
            <div className="text-2xl font-bold">{history.length}</div>
          </div>
          
          <div className="bg-[#fdf6f3] p-4 rounded-xl border border-[#f0e8e4]">
            <div className="font-semibold text-[#662b1f] mb-1">Total Hours</div>
            <div className="text-2xl font-bold">
              {history.reduce((total, record) => total + (parseFloat(record.workHours) || 0), 0).toFixed(1)}
            </div>
          </div>
          
          <div className="bg-[#fdf6f3] p-4 rounded-xl border border-[#f0e8e4]">
            <div className="font-semibold text-[#662b1f] mb-1">Average Hours/Day</div>
            <div className="text-2xl font-bold">
              {history.length ? (history.reduce((total, record) => total + (parseFloat(record.workHours) || 0), 0) / history.length).toFixed(1) : '0.0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;