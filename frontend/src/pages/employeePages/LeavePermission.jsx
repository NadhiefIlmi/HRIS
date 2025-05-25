import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Check, X, Filter, Trash2, ChevronRight } from 'lucide-react';
import API from '../../api/api';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function LeavePermission() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [form, setForm] = useState({ type: '', startDate: '', endDate: '', reason: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const token = localStorage.getItem('token');

  useDocumentTitle("Leaves Permission");

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredRequests(leaveRequests);
    } else {
      setFilteredRequests(leaveRequests.filter(request => request.status === activeFilter));
    }
  }, [activeFilter, leaveRequests]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/employee/leave-requests/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveRequests(response.data.leaveRequests);
      setFilteredRequests(response.data.leaveRequests);
      setError('');
    } catch (err) {
      setError('Failed to fetch leave requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post('/api/employee/leave-request', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(response.data.message);
      setError('');
      fetchLeaveRequests();
      setForm({ type: '', startDate: '', endDate: '', reason: '' });
      setIsFormOpen(false);
      
      // Show success message then fade out
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting leave request');
      setMessage('');
      
      // Show error message then fade out
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeaveRequest = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this leave request?');
    if (!confirmDelete) return;
    
    setLoading(true);
    try {
      await API.delete(`/api/employee/leave-request/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveRequests(leaveRequests.filter(request => request._id !== id));
      setMessage('Leave request deleted successfully!');
      
      // Show success message then fade out
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to delete leave request');
      
      // Show error message then fade out
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-rose-100 text-rose-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <Check size={14} className="mr-1" />;
      case 'rejected': return <X size={14} className="mr-1" />;
      case 'pending': return <Clock size={14} className="mr-1" />;
      default: return null;
    }
  };

  const getLeaveTypeColor = (type) => {
    switch(type) {
      case 'sick': return 'bg-blue-100 text-blue-700';
      case 'annual': return 'bg-indigo-100 text-indigo-700';
      case 'personal': return 'bg-purple-100 text-purple-700';
      case 'maternity': return 'bg-pink-100 text-pink-700';
      default: return 'bg-teal-100 text-teal-700';
    }
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] px-6 py-8 text-white">
        <h2 className="text-3xl font-bold">Leave Management</h2>
        <p className="mt-2 opacity-80">Submit and manage your leave requests efficiently</p>
      </div>

      {/* Content */}
      <div className="p-6 bg-white">
        {/* Notification area */}
        {(message || error) && (
          <div className={`mb-6 p-4 rounded-lg ${message ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'} flex items-center`}>
            {message ? 
              <Check size={20} className="text-green-500 mr-3" /> : 
              <AlertCircle size={20} className="text-red-500 mr-3" />
            }
            <p className={message ? 'text-green-700' : 'text-red-700'}>
              {message || error}
            </p>
          </div>
        )}

        {/* New Request Button */}
        <div className="mb-6">
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)} 
            className="bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] hover:opacity-90 text-white px-6 py-3 rounded-lg shadow-md flex items-center font-medium transition-all duration-200 transform hover:translate-y-px"
          >
            {isFormOpen ? 'Cancel Request' : 'New Leave Request'}
            <ChevronRight size={20} className="ml-2" />
          </button>
        </div>

        {/* Form */}
        {isFormOpen && (
          <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-[#662b1f] mb-4">Submit Leave Request</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#662b1f]">Leave Type</label>
                <select
                  id="type"
                  name="type"
                  className="w-full bg-white border rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-[#8a3b2d]/30 focus:border-[#8a3b2d] transition-all duration-200"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  required
                >
                  <option value="">Select Leave Type</option>
                  <option value="sick">Sick </option>
                  <option value="annual">Annual </option>
                  <option value="personal">Personal </option>
                  <option value="maternity">Maternity </option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#662b1f]">Start Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={18} className="text-[#8a3b2d]" />
                  </div>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-white border rounded-lg pl-10 pr-4 py-3 shadow-sm focus:ring-2 focus:ring-[#8a3b2d]/30 focus:border-[#8a3b2d] transition-all duration-200"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#662b1f]">End Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={18} className="text-[#8a3b2d]" />
                  </div>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full bg-white border rounded-lg pl-10 pr-4 py-3 shadow-sm focus:ring-2 focus:ring-[#8a3b2d]/30 focus:border-[#8a3b2d] transition-all duration-200"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-[#662b1f]">Reason</label>
                <textarea
                  name="reason"
                  placeholder="Please provide details for your leave request..."
                  rows="3"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full bg-white border rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-[#8a3b2d]/30 focus:border-[#8a3b2d] transition-all duration-200"
                />
              </div>
              
              <div className="md:col-span-2">
                <button
                  onClick={handleLeaveRequestSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] hover:opacity-90 text-white px-6 py-3 rounded-lg shadow-md font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all ${
              activeFilter === 'all' 
                ? 'bg-[#662b1f] text-white' 
                : 'bg-white text-[#662b1f] border'
            }`}
          >
            <Filter size={16} className="mr-2" />
            All
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all ${
              activeFilter === 'pending' 
                ? 'bg-amber-500 text-white' 
                : 'bg-white text-amber-700 border hover:bg-amber-50'
            }`}
          >
            <Clock size={16} className="mr-2" />
            Pending
          </button>
          <button
            onClick={() => setActiveFilter('approved')}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all ${
              activeFilter === 'approved' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-white text-emerald-700 border hover:bg-emerald-50'
            }`}
          >
            <Check size={16} className="mr-2" />
            Approved
          </button>
          <button
            onClick={() => setActiveFilter('rejected')}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all ${
              activeFilter === 'rejected' 
                ? 'bg-rose-500 text-white' 
                : 'bg-white text-rose-700 border hover:bg-rose-50'
            }`}
          >
            <X size={16} className="mr-2" />
            Rejected
          </button>
        </div>

        {/* Leave Requests List */}
        <div>
          <h3 className="text-xl font-semibold text-[#662b1f] mb-4">My Leave Requests</h3>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-[#f0e8e4] h-12 w-12"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-[#f0e8e4] rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-[#f0e8e4] rounded"></div>
                    <div className="h-4 bg-[#f0e8e4] rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white border rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-[#fdf6f3] rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-[#8a3b2d]" />
              </div>
              <h4 className="text-lg font-medium text-[#662b1f]">No leave requests found</h4>
              <p className="text-gray-500 mt-2">
                {activeFilter !== 'all' 
                  ? `You don't have any ${activeFilter} leave requests.` 
                  : "You haven't submitted any leave requests yet."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <div 
                  key={request._id}
                  className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(request.type)}`}>
                          {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Leave
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-semibold text-[#662b1f] mb-2">
                        {calculateDuration(request.startDate, request.endDate)}
                      </h4>
                      
                      <div className="flex items-center text-gray-600 mb-3">
                        <Calendar size={16} className="mr-2 text-[#8a3b2d]" />
                        <span>
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </span>
                      </div>
                      
                      {request.reason && (
                        <p className="text-gray-600 text-sm border-t pt-3 mt-2">
                          {request.reason}
                        </p>
                      )}
                    </div>
                    
                    {['pending', 'rejected', 'approved'].includes(request.status) && (
                      <div className="flex items-start">
                        <button
                          onClick={() => handleDeleteLeaveRequest(request._id)}
                          className="text-[#8a3b2d] hover:text-[#662b1f] p-2 rounded-full hover:bg-[#fdf6f3] transition-colors"
                          title="Delete request"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}