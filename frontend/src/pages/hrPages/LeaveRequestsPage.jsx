import React, { useEffect, useState } from 'react';
import API from '../../api/api';
import { Calendar, User, Briefcase, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LeaveRequestsPage({ updatePendingLeavesCount }) {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useDocumentTitle("Leave Requests");

  // Initialize toast configuration
  const showSuccessToast = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      style: {
        backgroundColor: '#f0fdf4',
        color: '#166534',
        borderLeft: '4px solid #22c55e'
      }
    });
  };

  const showErrorToast = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      style: {
        backgroundColor: '#fef2f2',
        color: '#b91c1c',
        borderLeft: '4px solid #ef4444'
      }
    });
  };

  const fetchLeaveRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await API.get('/api/hr/leave-requests/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveRequests(res.data.pendingRequests);
      
      // Update the pending count in parent component
      if (updatePendingLeavesCount) {
        updatePendingLeavesCount(res.data.pendingRequests.length);
      }
      
      return res.data.pendingRequests;
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      
      let errorMessage = 'Failed to load leave requests';
      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      showErrorToast(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id, decision) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      await API.put(
        `/api/hr/approve-leave/${id}`,
        { status: decision },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const action = decision === 'approved' ? 'approved' : 'rejected';
      showSuccessToast(`Leave request ${action} successfully`);
      
      // Fetch updated requests and update count
      const updatedRequests = await fetchLeaveRequests();
      
    } catch (err) {
      console.error('Error updating leave request:', err.response?.data || err.message);
      
      let errorMessage = 'Failed to process leave request';
      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      showErrorToast(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const getLeaveTypeColor = (type) => {
    if (!type) return { bg: 'bg-[#f5e8e0]', text: 'text-[#662b1f]' };

    const types = {
      sick: { bg: 'bg-blue-100', text: 'text-blue-800' },
      annual: { bg: 'bg-[#f5e8e0]', text: 'text-[#662b1f]' },
      personal: { bg: 'bg-amber-100', text: 'text-amber-800' },
      maternity: { bg: 'bg-pink-100', text: 'text-pink-800' },
      other: { bg: 'bg-gray-100', text: 'text-gray-800' }
    };

    return types[type.toLowerCase()] || { bg: 'bg-[#f5e8e0]', text: 'text-[#662b1f]' };
  };

  // Calculate working days (Mon-Fri) between startDate and endDate inclusive
  const calculateWorkingDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    let current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const calculateDuration = (startDate, endDate) => {
    return calculateWorkingDays(startDate, endDate);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#662b1f]" />
          <p className="text-[#662b1f] font-medium">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#662b1f]/5 to-orange-200/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page-specific header */}
        <div className="relative bg-gradient-to-r from-[#662b1f] via-[#7d3420] to-[#8b3a1f] rounded-3xl p-8 mb-8 text-white shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/3 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative">
            <div className="flex items-center mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full mr-4"></div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                Leave Requests Management
              </h2>
            </div>
            <p className="text-white/90 text-lg font-medium">
              Review and approve employee time-off requests
            </p>
          </div>
        </div>

        {/* Leave Requests List */}
        {leaveRequests.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-white/50">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">No Pending Leave Requests</h3>
            <p className="text-gray-400">All leave requests have been processed</p>
          </div>
        ) : (
          <div className="space-y-6">
            {leaveRequests.map((request) => {
              const leaveColors = getLeaveTypeColor(request.type);
              const duration = calculateDuration(request.startDate, request.endDate);
              
              return (
                <div key={request._id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#662b1f] to-[#8b3a1f] rounded-full flex items-center justify-center shadow-md">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.employeeId?.employee_name || request.employeeId?.username || 'Unknown Employee'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Employee ID: {request.employeeId?.nik || request.employeeId?._id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${leaveColors.bg} ${leaveColors.text} shadow-sm`}>
                        {request.type?.charAt(0).toUpperCase() + request.type?.slice(1) || 'Unknown'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 shadow-sm">
                        Pending
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center space-x-3 bg-gray-50/50 p-3 rounded-xl">
                      <Calendar className="w-5 h-5 text-[#662b1f]" />
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p className="font-medium text-gray-900">{formatDate(request.startDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-gray-50/50 p-3 rounded-xl">
                      <Calendar className="w-5 h-5 text-[#662b1f]" />
                      <div>
                        <p className="text-sm text-gray-500">End Date</p>
                        <p className="font-medium text-gray-900">{formatDate(request.endDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-gray-50/50 p-3 rounded-xl">
                      <Clock className="w-5 h-5 text-[#662b1f]" />
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium text-gray-900">{duration} day{duration !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-gray-50/50 p-3 rounded-xl">
                      <Briefcase className="w-5 h-5 text-[#662b1f]" />
                      <div>
                        <p className="text-sm text-gray-500">Requested</p>
                        <p className="font-medium text-gray-900">{formatDate(request.requestedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {request.reason && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-1">Reason</p>
                      <p className="text-gray-900 bg-gray-50/50 p-3 rounded-lg">{request.reason}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => handleDecision(request._id, 'rejected')}
                      disabled={processingId === request._id}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-red-100 to-red-50 text-red-700 rounded-xl hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200/50"
                    >
                      {processingId === request._id ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Reject
                    </button>
                    
                    <button
                      onClick={() => handleDecision(request._id, 'approved')}
                      disabled={processingId === request._id}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-green-50 text-green-700 rounded-xl hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-green-200/50"
                    >
                      {processingId === request._id ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-[#662b1f] to-orange-500 rounded-full"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              &copy; 2024 HR Management System
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Built with care for better workforce management ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaveRequestsPage;