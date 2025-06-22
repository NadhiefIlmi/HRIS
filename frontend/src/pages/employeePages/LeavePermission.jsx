import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  AlertCircle,
  Check,
  X,
  Filter,
  Trash2,
  ChevronRight,
  ArrowRight,
  Zap,
} from "lucide-react";
import API from "../../api/api";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LeavePermission() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [form, setForm] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [remainingAnnualLeave, setRemainingAnnualLeave] = useState(null);
  const token = localStorage.getItem("token");

  useDocumentTitle("Leaves Permission");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      },
    },
  };

  const cardHoverVariants = {
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
      transition: { duration: 0.3 },
    },
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    // Fetch leave info to get remainingAnnualLeave
    const fetchLeaveInfo = async () => {
      try {
        const response = await API.get("/api/employee/leave-info", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched remainingAnnualLeave:", response.data.remainingAnnualLeave);
        setRemainingAnnualLeave(response.data.remainingAnnualLeave);
      } catch (err) {
        console.error("Failed to fetch leave info", err);
      }
    };

    fetchLeaveInfo();
  }, [token]);

  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredRequests(leaveRequests);
    } else {
      setFilteredRequests(
        leaveRequests.filter((request) => request.status === activeFilter)
      );
    }
  }, [activeFilter, leaveRequests]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const response = await API.get("/api/employee/leave-requests/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveRequests(response.data.leaveRequests);
      setFilteredRequests(response.data.leaveRequests);
      setError("");
    } catch (err) {
      setError("Failed to fetch leave requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!form.type || !form.startDate || !form.endDate) {
      toast.error("Please fill in all required fields", { position: "top-right" });
      setLoading(false);
      return;
    }

    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      toast.error("Start date cannot be in the past", { position: "top-right" });
      setLoading(false);
      return;
    }

    if (endDate < startDate) {
      toast.error("End date cannot be before start date", { position: "top-right" });
      setLoading(false);
      return;
    }

    const totalDays = calculateTotalDays(form.startDate, form.endDate);
    console.log("Calculated totalDays:", totalDays);
    console.log("Current remainingAnnualLeave:", remainingAnnualLeave);

    // Client-side validation for leave quota for all leave types
    const leaveTypesToCheck = ['sick', 'annual', 'personal', 'maternity', 'other'];
    if (leaveTypesToCheck.includes(form.type) && remainingAnnualLeave !== null && totalDays > remainingAnnualLeave) {
      toast.error("Your leave request exceeds your remaining annual leave quota.", { position: "top-right" });
      setLoading(false);
      return;
    }

    console.log(`Submitting leave request for ${totalDays} days`);

    try {
      const response = await API.post("/api/employee/leave-request", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(response.data.message, { position: "top-right" });
      setError("");
      fetchLeaveRequests();
      setForm({ type: "", startDate: "", endDate: "", reason: "" });
      setIsFormOpen(false);

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting leave request", { position: "top-right" });
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeaveRequest = async (id) => {
    // Show toast confirmation instead of window.confirm
    const confirmId = `confirm-delete-${id}`;
    const toastId = toast.info(
      <div>
        <p>Are you sure you want to delete this leave request?</p>
        <div className="mt-2 flex justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss(toastId);
              deleteLeaveRequest(id);
            }}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
          >
            No
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
      }
    );
  };

  const deleteLeaveRequest = async (id) => {
    setLoading(true);
    try {
      await API.delete(`/api/employee/leave-request/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveRequests(leaveRequests.filter((request) => request._id !== id));
      toast.success("Leave request deleted successfully!", { position: "top-right" });

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      setError("Failed to delete leave request");

      setTimeout(() => {
        setError("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-700";
      case "rejected":
        return "bg-rose-100 text-rose-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <Check size={14} className="mr-1" />;
      case "rejected":
        return <X size={14} className="mr-1" />;
      case "pending":
        return <Clock size={14} className="mr-1" />;
      default:
        return null;
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case "sick":
        return "bg-blue-100 text-blue-700";
      case "annual":
        return "bg-indigo-100 text-indigo-700";
      case "personal":
        return "bg-purple-100 text-purple-700";
      case "maternity":
        return "bg-pink-100 text-pink-700";
      default:
        return "bg-teal-100 text-teal-700";
    }
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
    const workingDays = calculateWorkingDays(startDate, endDate);
    return `${workingDays} day${workingDays > 1 ? "s" : ""}`;
  };

  const calculateTotalDays = (startDate, endDate) => {
    return calculateWorkingDays(startDate, endDate);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen  from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden p-4 md:p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 space-y-8"
      >
        {/* Header Card */}
        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-br from-[#662b1f] via-[#7d3420] to-[#8a3b2d] rounded-3xl p-8 text-white  overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              ></div>
            </div>

            <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse"></div>
            <div
              className="absolute bottom-4 left-4 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Calendar size={24} />
                </div>
                <h2 className="text-2xl font-bold">Leave Management</h2>
                <div className="px-3 py-1 rounded-full bg-orange-400/20 text-orange-100 text-sm font-medium flex items-center gap-1">
                  <Zap size={12} />
                  Active
                </div>
              </div>

              <p className="opacity-90 max-w-2xl">
                Submit and manage your leave requests efficiently
              </p>
            </div>
          </div>
        </motion.div>

        {/* Notification area */}
        <motion.div variants={itemVariants}>
          {(message || error) && (
            <div
              className={`p-4 rounded-lg ${
                message
                  ? "bg-green-50 border-l-4 border-green-500"
                  : "bg-red-50 border-l-4 border-red-500"
              } flex items-center shadow-sm`}
            >
              {message ? (
                <Check size={20} className="text-green-500 mr-3" />
              ) : (
                <AlertCircle size={20} className="text-red-500 mr-3" />
              )}
              <p className={message ? "text-green-700" : "text-red-700"}>
                {message || error}
              </p>
            </div>
          )}
        </motion.div>

        {/* New Request Button */}
        <motion.div variants={itemVariants}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] hover:opacity-90 text-white px-6 py-3 rounded-xl shadow-lg flex items-center font-medium transition-all duration-200"
          >
            {isFormOpen ? "Cancel Request" : "New Leave Request"}
            <ArrowRight size={20} className="ml-2" />
          </motion.button>
        </motion.div>

        {/* Form */}
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg p-6 mb-8 overflow-hidden"
          >
            <h3 className="text-lg font-semibold text-[#662b1f] mb-4">
              Submit Leave Request
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#662b1f]">
                  Leave Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-[#8a3b2d]/30 focus:border-[#8a3b2d] transition-all duration-200"
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
                <label className="block text-sm font-medium text-[#662b1f]">
                  Start Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={18} className="text-[#8a3b2d]" />
                  </div>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 shadow-sm focus:ring-2 focus:ring-[#8a3b2d]/30 focus:border-[#8a3b2d] transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#662b1f]">
                  End Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={18} className="text-[#8a3b2d]" />
                  </div>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 shadow-sm focus:ring-2 focus:ring-[#8a3b2d]/30 focus:border-[#8a3b2d] transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* New column to show duration in days */}
              <div className="space-y-2 flex flex-col justify-end">
                <label className="block text-sm font-medium text-[#662b1f]">
                  Duration
                </label>
                <div className="py-3 px-4 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                  {form.startDate && form.endDate
                    ? calculateDuration(form.startDate, form.endDate)
                    : "-"}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-[#662b1f]">
                  Reason
                </label>
                <textarea
                  name="reason"
                  placeholder="Please provide details for your leave request..."
                  rows="3"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-[#8a3b2d]/30 focus:border-[#8a3b2d] transition-all duration-200"
                />
              </div>

              <div className="md:col-span-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLeaveRequestSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] hover:opacity-90 text-white px-6 py-3 rounded-xl shadow-lg font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting..." : "Submit Leave Request"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all ${
              activeFilter === "all"
                ? "bg-[#662b1f] text-white shadow-md"
                : "bg-white text-[#662b1f] border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Filter size={16} className="mr-2" />
            All
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter("pending")}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all ${
              activeFilter === "pending"
                ? "bg-amber-500 text-white shadow-md"
                : "bg-white text-amber-700 border border-gray-200 hover:bg-amber-50"
            }`}
          >
            <Clock size={16} className="mr-2" />
            Pending
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter("approved")}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all ${
              activeFilter === "approved"
                ? "bg-emerald-500 text-white shadow-md"
                : "bg-white text-emerald-700 border border-gray-200 hover:bg-emerald-50"
            }`}
          >
            <Check size={16} className="mr-2" />
            Approved
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter("rejected")}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all ${
              activeFilter === "rejected"
                ? "bg-rose-500 text-white shadow-md"
                : "bg-white text-rose-700 border border-gray-200 hover:bg-rose-50"
            }`}
          >
            <X size={16} className="mr-2" />
            Rejected
          </motion.button>
        </motion.div>

        {/* Leave Requests List */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-[#662b1f] to-[#8a3b2d] rounded-full"></div>
              <h3 className="text-2xl font-bold text-gray-800">
                My Leave Requests
              </h3>
            </div>
          </div>

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
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 text-center shadow-sm"
            >
              <div className="w-16 h-16 bg-[#fdf6f3] rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-[#8a3b2d]" />
              </div>
              <h4 className="text-lg font-medium text-[#662b1f]">
                No leave requests found
              </h4>
              <p className="text-gray-500 mt-2">
                {activeFilter !== "all"
                  ? `You don't have any ${activeFilter} leave requests.`
                  : "You haven't submitted any leave requests yet."}
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <motion.div
                  key={request._id}
                  variants={itemVariants}
                  whileHover="hover"
                  className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(
                            request.type
                          )}`}
                        >
                          {request.type.charAt(0).toUpperCase() +
                            request.type.slice(1)}{" "}
                          Leave
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </span>
                      </div>

                      <h4 className="text-lg font-semibold text-[#662b1f] mb-2">
                        {calculateDuration(request.startDate, request.endDate)}
                      </h4>

                      <div className="flex items-center text-gray-600 mb-3">
                        <Calendar size={16} className="mr-2 text-[#8a3b2d]" />
                        <span>
                          {formatDate(request.startDate)} -{" "}
                          {formatDate(request.endDate)}
                        </span>
                      </div>

                      {request.reason && (
                        <p className="text-gray-600 text-sm border-t pt-3 mt-2">
                          {request.reason}
                        </p>
                      )}
                    </div>

                    {["pending", "rejected", "approved"].includes(
                      request.status
                    ) && (
                      <div className="flex items-start">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteLeaveRequest(request._id)}
                          className="text-[#8a3b2d] hover:text-[#662b1f] p-2 rounded-full hover:bg-[#fdf6f3] transition-colors"
                          title="Delete request"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}