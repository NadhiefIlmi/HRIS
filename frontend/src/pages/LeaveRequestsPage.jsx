import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, User, Briefcase, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

function LeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: null, message: null });
  const [processingId, setProcessingId] = useState(null);

  const fetchLeaveRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/hr/leave-requests/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveRequests(res.data.pendingRequests);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      showNotification('error', 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: null, message: null }), 4000);
  };

  const handleDecision = async (id, decision) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/hr/approve-leave/${id}`,
        { status: decision },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification('success', `Leave request ${decision} successfully`);
      fetchLeaveRequests();
    } catch (err) {
      console.error('Error updating leave request:', err.response?.data || err.message);
      showNotification('error', 'Failed to process leave request');
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const getLeaveTypeColor = (type) => {
    if (!type) return { bg: 'bg-[#f5e8e0]', text: 'text-[#662b1f]' };

    const types = {
      sick: { bg: 'bg-blue-100', text: 'text-blue-800' },
      vacation: { bg: 'bg-[#f5e8e0]', text: 'text-[#662b1f]' },
      personal: { bg: 'bg-amber-100', text: 'text-amber-800' },
      bereavement: { bg: 'bg-gray-100', text: 'text-gray-800' }
    };

    return types[type.toLowerCase()] || { bg: 'bg-[#f5e8e0]', text: 'text-[#662b1f]' };
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#fefcfb]">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#662b1f]">Leave Requests</h1>
            <p className="text-[#4a3b36] mt-1">Manage pending employee leave requests</p>
          </div>
          <div className="bg-white rounded-full px-4 py-2 shadow-sm border border-[#f5e8e0] flex items-center gap-2">
            <Clock size={16} className="text-[#662b1f]" />
            <span className="text-sm font-medium text-[#4a3b36]">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>

          </div>
        </div>

        {notification.message && (
          <div className={`mb-6 p-4 rounded-lg shadow-sm flex items-center gap-3 ${notification.type === 'success'
              ? 'bg-green-50 text-green-700 border-l-4 border-green-500'
              : 'bg-red-50 text-red-700 border-l-4 border-red-500'
            } transition-all duration-500 ease-in-out`}>
            {notification.type === 'success' ? (
              <CheckCircle size={20} className="text-green-500" />
            ) : (
              <AlertCircle size={20} className="text-red-500" />
            )}
            <p>{notification.message}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={40} className="animate-spin text-[#662b1f]" />
          </div>
        ) : Array.isArray(leaveRequests) && leaveRequests.length > 0 ? (
          <div className="space-y-6">
            {leaveRequests.map((request) => {
              const leaveTypeStyle = getLeaveTypeColor(request.type);
              const duration = calculateDuration(request.startDate, request.endDate);

              return (
                <div
                  key={request._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-[#f5e8e0]"
                >
                  <div className="p-6">
                    <div className="flex justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-[#662b1f] flex items-center justify-center text-white font-medium text-xl shadow-sm">
                          {request.employeeId?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#4a3b36]">
                            {request.employeeId?.username || 'Unknown Employee'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Briefcase size={14} />
                            <span>{request.employeeId?.department || 'No Department'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${leaveTypeStyle.bg} ${leaveTypeStyle.text}`}>
                          {request.type?.charAt(0).toUpperCase() + request.type?.slice(1) || 'Unknown'} Leave
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="bg-[#fefcfb] rounded-lg p-4 border border-[#f5e8e0]">
                        <div className="flex items-center gap-2 text-[#662b1f] font-medium mb-2">
                          <Calendar size={16} />
                          <span>Leave Details</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#4a3b36]">Duration:</span>
                            <span className="font-medium text-[#662b1f]">{duration} day{duration !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#4a3b36]">From:</span>
                            <span className="font-medium text-[#662b1f]">{formatDate(request.startDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#4a3b36]">To:</span>
                            <span className="font-medium text-[#662b1f]">{formatDate(request.endDate)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-[#662b1f] font-medium mb-2">
                          <User size={16} />
                          <span>Reason</span>
                        </div>
                        <p className="text-[#4a3b36] bg-[#fefcfb] p-4 rounded-lg min-h-16 text-sm border border-[#f5e8e0]">
                          {request.reason || 'No reason provided'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3 justify-end">
                      <button
                        onClick={() => handleDecision(request._id, 'rejected')}
                        disabled={processingId === request._id}
                        className="flex items-center gap-2 px-4 py-2 border border-[#f5e8e0] text-[#4a3b36] rounded-lg hover:bg-[#f5e8e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === request._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <XCircle size={16} className="text-red-500" />
                        )}
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleDecision(request._id, 'approved')}
                        disabled={processingId === request._id}
                        className="flex items-center gap-2 px-4 py-2 bg-[#662b1f] text-white rounded-lg hover:bg-[#501f17] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === request._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-[#f5e8e0]">
            <div className="flex justify-center mb-4">
              <Calendar size={48} className="text-[#662b1f] opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-[#662b1f] mb-1">No pending requests</h3>
            <p className="text-[#4a3b36]">There are no leave requests waiting for your approval at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveRequestsPage;