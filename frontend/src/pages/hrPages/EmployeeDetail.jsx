import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";
import {
  FaBuilding,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaUser,
  FaTrash,
  FaUpload,
  FaMapMarkerAlt,
  FaFileAlt,
  FaMedkit,
  FaShieldAlt,
  FaGraduationCap,
  FaChalkboardTeacher,
} from "react-icons/fa";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Loader2,
  Edit,
} from "lucide-react";

const ElegantPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showPages = 3,
  className = "",
}) => {
  const getVisiblePages = () => {
    if (totalPages <= showPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.floor((currentPage - 1) / showPages) * showPages + 1;
    let end = Math.min(start + showPages - 1, totalPages);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const showLeftEllipsis = visiblePages[0] > 2;
  const showRightEllipsis =
    visiblePages[visiblePages.length - 1] < totalPages - 1;

  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex items-center justify-center space-x-1 mt-6 ${className}`}
    >
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-[#662b1f] hover:text-[#662b1f] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-all duration-200 shadow-sm"
      >
        <ChevronLeft size={16} />
      </button>

      {/* First Page */}
      {!visiblePages.includes(1) && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-[#662b1f] hover:text-[#662b1f] transition-all duration-200 shadow-sm font-medium"
          >
            1
          </button>
          {showLeftEllipsis && (
            <div className="flex items-center justify-center w-10 h-10">
              <MoreHorizontal size={16} className="text-gray-400" />
            </div>
          )}
        </>
      )}

      {/* Visible Pages */}
      {visiblePages.map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`flex items-center justify-center w-10 h-10 rounded-lg font-medium transition-all duration-200 shadow-sm ${
            currentPage === pageNum
              ? "bg-gradient-to-r from-[#662b1f] to-[#8a3b2a] text-white shadow-md transform scale-105 border-0"
              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-[#662b1f] hover:text-[#662b1f]"
          }`}
        >
          {pageNum}
        </button>
      ))}

      {/* Last Page */}
      {!visiblePages.includes(totalPages) && (
        <>
          {showRightEllipsis && (
            <div className="flex items-center justify-center w-10 h-10">
              <MoreHorizontal size={16} className="text-gray-400" />
            </div>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-[#662b1f] hover:text-[#662b1f] transition-all duration-200 shadow-sm font-medium"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-[#662b1f] hover:text-[#662b1f] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-all duration-200 shadow-sm"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [attendancePage, setAttendancePage] = useState(1);
  const [educationPage, setEducationPage] = useState(1);
  const [trainingPage, setTrainingPage] = useState(3);

  const attendancePageSize = 5;
  const educationPageSize = 3;
  const trainingPageSize = 3;

  // Department color mapping
  const deptColors = {
    Production: { bg: "bg-blue-100", text: "text-blue-800" },
    Engineering: { bg: "bg-purple-100", text: "text-purple-800" },
    Sales: { bg: "bg-green-100", text: "text-green-800" },
    Marketing: { bg: "bg-pink-100", text: "text-pink-800" },
    Finance: { bg: "bg-amber-100", text: "text-amber-800" },
    default: { bg: "bg-gray-100", text: "text-gray-800" }
  };
  const deptStyle = employee ? deptColors[employee.department] || deptColors.default : deptColors.default;

  const totalAttendancePages = Math.ceil(
    (employee?.attendanceRecords?.length || 0) / attendancePageSize
  );
  const totalEducationPages = Math.ceil(
    (employee?.educationHistory?.length || 0) / educationPageSize
  );
  const totalTrainingPages = Math.ceil(
    (employee?.trainingHistory?.length || 0) / trainingPageSize
  );

  const navigate = useNavigate();

  useDocumentTitle("Employee Detail");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setUploadMessage("");
    } else {
      setUploadMessage("Only PDF files are allowed.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setUploadMessage("");
    } else {
      setUploadMessage("Only PDF files are allowed.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("salarySlip", file);

    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await API.post(
        `/api/hr/upload-salary-slip/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadMessage(response.data.message);
      setFile(null);

      const employeeResponse = await API.get("/api/hr/employee", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedEmployee = employeeResponse.data.find(
        (emp) => emp._id === id
      );
      if (updatedEmployee) {
        setEmployee(updatedEmployee);
      }
    } catch (error) {
      console.error("Error uploading salary slip:", error);
      setUploadMessage("Failed to upload salary slip");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadMessage(""), 5000);
    }
  };

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await API.get("/api/hr/employee", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const found = response.data.find((emp) => emp._id === id);
        if (found) {
          setEmployee(found);
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  useEffect(() => {
    const fetchExistingFile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get(`/api/hr/salary-slip/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.salarySlip) {
          setFile({
            name: res.data.salarySlip.split("/").pop(),
            url: res.data.salarySlip,
          });
        }
      } catch (err) {
        console.error("Failed to fetch salary slip:", err);
      }
    };

    fetchExistingFile();
  }, [id]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/api/hr/deleteEmployee/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Employee deleted successfully");
      navigate("/employees");
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee");
    }
  };

  const formatDate = (dateString, includeTimes = true) => {
    if (!dateString) return "—";
    const date = new Date(dateString);

    if (!includeTimes) {
      const dateOptions = {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      };
      return date.toLocaleDateString("en-GB", dateOptions);
    }

    const dateOptions = {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    };

    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    const formattedDate = date.toLocaleDateString("en-GB", dateOptions);
    const formattedTime = date.toLocaleTimeString("en-GB", timeOptions);

    return `${formattedDate} at ${formattedTime}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#662b1f] mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">
            Loading employee data...
          </p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold text-gray-700">Employee Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-5 py-2 bg-[#662b1f] text-white rounded-md hover:bg-[#8a3b2a] transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const dob = formatDate(employee.dob, false);
  const joint_date = formatDate(employee.joint_date, false);
  const contract_end_date = formatDate(employee.contract_end_date, false);

  return (
    <div className="min-h-screen  from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#662b1f]/5 to-orange-200/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header Section */}
        <div className="relative bg-gradient-to-r from-[#662b1f] via-[#7d3420] to-[#8b3a1f] rounded-3xl p-8 mb-8 text-white shadow-2xl overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/3 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 mb-6 md:mb-0">
              <div className="flex items-center mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full mr-4"></div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                  {employee.username}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${deptStyle.bg} ${deptStyle.text}`}>
                  {employee.department || "No Department"}
                </span>
    
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition font-medium flex items-center gap-2"
              >
                <ChevronLeft size={18} />
                <span>Back</span>
              </button>
              <button
                onClick={() => navigate(`/employee/detail/${employee._id}`)}
                className="px-5 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition font-medium flex items-center gap-2"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 bg-red-600/90 text-white rounded-xl hover:bg-red-700 transition font-medium flex items-center gap-2"
              >
                <FaTrash size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden relative">
          {/* Profile Photo Section */}
          <div className="flex justify-center -mt-20 mb-6 z-10 pt-20">
            <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white relative group">
              {employee.photo ? (
                <img
                  src={`${API.defaults.baseURL}${employee.photo}`}
                  alt={employee.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-profile.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#662b1f] to-[#8a3b2a] text-white text-4xl font-bold uppercase">
                  {(employee.employee_name || employee.username)?.charAt(0)}
                </div>
              )}
             
            </div>
          </div>

          {/* Content Sections */}
          <div className="px-6 pb-8 md:px-8">
            {/* Information Sections */}
            <div className="space-y-8">
              {/* Personal Information Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#662b1f] flex items-center">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-3"></div>
                    Personal Information
                  </h3>
                </div>

                
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoCard 
                    icon={<FaUser className="text-[#662b1f]" size={20} />}
                    title="Username"
                    value={employee.username || "—"}
                  />

                  <InfoCard 
                    icon={<FaUser className="text-[#662b1f]" size={20} />}
                    title="Full Name"
                    value={employee.employee_name || employee.username || "—"}
                  />
                  
                  <InfoCard 
                    icon={<FaBuilding className="text-[#662b1f]" size={20} />}
                    title="Department"
                    value=
                      
                        {employee.department || "—"}
                     
                    
                  />
                  
                  <InfoCard 
                    icon={<FaIdCard className="text-[#662b1f]" size={20} />}
                    title="NIK"
                    value={employee.nik || "—"}
                  />
                  
                  <InfoCard 
                    icon={<FaUser className="text-[#662b1f]" size={20} />}
                    title="Gender"
                    value={employee.gender ? employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1) : "—"}
                  />
                  
                  <InfoCard 
                    icon={<FaCalendarAlt className="text-[#662b1f]" size={20} />}
                    title="Date of Birth"
                    value={dob}
                  />
                  
                  <InfoCard 
                    icon={<FaMapMarkerAlt className="text-[#662b1f]" size={20} />}
                    title="Place of Birth"
                    value={employee.pob || "—"}
                  />
                  
                  <InfoCard 
                    icon={<FaEnvelope className="text-[#662b1f]" size={20} />}
                    title="Email"
                    value={
                      <span className="break-all">
                        {employee.email || "—"}
                      </span>
                    }
                  />
                  
                  <InfoCard 
                    icon={<FaPhone className="text-[#662b1f]" size={20} />}
                    title="Phone Number"
                    value={employee.phone_nmb || "—"}
                  />
                  
                  <InfoCard 
                    icon={<FaMapMarkerAlt className="text-[#662b1f]" size={20} />}
                    title="KTP Address"
                    value={employee.ktp_address || "—"}
                    fullWidth
                  />
                </div>
              </div>

              {/* Official Documents Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-[#662b1f] mb-6 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-3"></div>
                  Official Documents
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoCard 
                    icon={<FaFileAlt className="text-[#662b1f]" size={20} />}
                    title="KTP Number"
                    value={employee.ktp_number || "—"}
                  />
                  
                  <InfoCard 
                    icon={<FaFileAlt className="text-[#662b1f]" size={20} />}
                    title="KK Number"
                    value={employee.kk_number || "—"}
                  />
                  
                  <InfoCard 
                    icon={<FaFileAlt className="text-[#662b1f]" size={20} />}
                    title="NPWP Number"
                    value={employee.npwp_number || "—"}
                  />
                </div>
              </div>

              {/* Employment Information Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-[#662b1f] mb-6 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-3"></div>
                  Employment Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoCard 
                    icon={<FaBuilding className="text-[#662b1f]" size={20} />}
                    title="Join Date"
                    value={joint_date}
                  />
                  
                  <InfoCard 
                    icon={<FaCalendarAlt className="text-[#662b1f]" size={20} />}
                    title="Contract End Date"
                    value={contract_end_date}
                  />
                  
                  
                </div>
              </div>

              {/* BPJS Information Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-[#662b1f] mb-6 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-3"></div>
                  BPJS Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard 
                    icon={<FaMedkit className="text-green-600" size={20} />}
                    title="BPJS Kesehatan Number"
                    value={employee.bpjs_kesehatan_no || "—"}
                    color="green"
                  />
                  
                  <InfoCard 
                    icon={<FaMedkit className="text-green-600" size={20} />}
                    title="BPJS Clinic"
                    value={employee.bpjs_clinic || "—"}
                    color="green"
                  />
                  
                  <InfoCard 
                    icon={<FaShieldAlt className="text-blue-600" size={20} />}
                    title="BPJS TK Number"
                    value={employee.bpjs_tk_no || "—"}
                    color="blue"
                  />
                  
                  <InfoCard 
                    icon={<FaShieldAlt className="text-blue-600" size={20} />}
                    title="BPJS JP Number"
                    value={employee.bpjs_jp_no || "—"}
                    color="blue"
                  />
                </div>
              </div>

              {/* Leave Information */}
              {employee.leaveInfo && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-[#662b1f] mb-6 flex items-center">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-3"></div>
                    Leave Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard 
                      icon={<FaCalendarAlt className="text-green-600" size={20} />}
                      title="Total Annual Leave"
                      value={`${employee.leaveInfo.totalAnnualLeave || 0} days`}
                      color="green"
                    />
                    
                    <StatCard 
                      icon={<FaCalendarAlt className="text-red-600" size={20} />}
                      title="Used Leave"
                      value={`${employee.leaveInfo.usedAnnualLeave || 0} days`}
                      color="red"
                    />
                    
                    <StatCard 
                      icon={<FaCalendarAlt className="text-blue-600" size={20} />}
                      title="Remaining Leave"
                      value={`${employee.leaveInfo.remainingAnnualLeave || 0} days`}
                      color="blue"
                    />
                  </div>
                </div>
              )}

              {/* Attendance Records */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#662b1f] flex items-center">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-3"></div>
                    Recent Attendance Records
                  </h3>
                  <button 
                    onClick={() => navigate(`/attendance/${employee._id}`)}
                    className="text-sm text-[#662b1f] hover:underline"
                  >
                    View All
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check In
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check Out
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(employee.attendanceRecords || [])
                        .slice()
                        .reverse()
                        .slice(
                          (attendancePage - 1) * attendancePageSize,
                          attendancePage * attendancePageSize
                        )
                        .map((record, index) => {
                          // Only show record if checkIn or checkOut is within last 24 hours
                          const now = new Date();
                          const checkInDate = record.checkIn ? new Date(record.checkIn) : null;
                          const checkOutDate = record.checkOut ? new Date(record.checkOut) : null;
                          const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

                          const isRecent =
                            (checkInDate && checkInDate >= twentyFourHoursAgo) ||
                            (checkOutDate && checkOutDate >= twentyFourHoursAgo);

                          if (!isRecent) {
                            return null;
                          }

                          return (
                            <tr key={index}>
                              <td className="py-4 px-4 text-sm text-gray-900">
                                {formatDate(record.checkIn, false)}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900">
                                {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : "—"}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900">
                                {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      {(!employee.attendanceRecords || employee.attendanceRecords.length === 0) && (
                        <tr>
                          <td colSpan="4" className="py-4 px-4 text-sm text-center text-gray-500">
                            No attendance records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <ElegantPagination
                  currentPage={attendancePage}
                  totalPages={totalAttendancePages}
                  onPageChange={setAttendancePage}
                  className="mt-6"
                />
              </div>

              {/* Education History */}
              {employee.educationHistory && employee.educationHistory.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-[#662b1f] mb-6 flex items-center">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-3"></div>
                    Education History
                  </h3>
                  
                  <div className="space-y-4">
                    {employee.educationHistory
                      .slice(
                        (educationPage - 1) * educationPageSize,
                        educationPage * educationPageSize
                      )
                      .map((edu, index) => (
                        <div key={index} className="border-l-4 border-[#662b1f] pl-4 py-2">
                          <div className="flex items-start">
                            <div className="p-2 bg-[#662b1f]/10 rounded-lg mr-4">
                              <FaGraduationCap className="text-[#662b1f]" size={18} />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{edu.last_education || "—"}</h4>
                              <p className="text-sm text-gray-600">{edu.institution || "—"}</p>
                              <div className="flex flex-wrap gap-x-4 mt-1">
                                <span className="text-sm text-gray-500">
                                  <span className="font-medium">Major:</span> {edu.majority || "—"}
                                </span>
                                <span className="text-sm text-gray-500">
                                  <span className="font-medium">Year:</span> {edu.year_of_graduation || "—"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  <ElegantPagination
                    currentPage={educationPage}
                    totalPages={totalEducationPages}
                    onPageChange={setEducationPage}
                    className="mt-6"
                  />
                </div>
              )}

              {/* Training History */}
              {employee.trainingHistory && employee.trainingHistory.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-[#662b1f] mb-6 flex items-center">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-3"></div>
                    Training History
                  </h3>
                  
                  <div className="space-y-4">
                    {employee.trainingHistory
                      .slice(
                        (trainingPage - 1) * trainingPageSize,
                        trainingPage * trainingPageSize
                      )
                      .map((training, index) => (
                        <div key={index} className="border-l-4 border-[#662b1f] pl-4 py-2">
                          <div className="flex items-start">
                            <div className="p-2 bg-[#662b1f]/10 rounded-lg mr-4">
                              <FaChalkboardTeacher className="text-[#662b1f]" size={18} />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{training.title || "—"}</h4>
                              <p className="text-sm text-gray-600">{training.provider || "—"}</p>
                              <div className="flex flex-wrap gap-x-4 mt-1">
                                <span className="text-sm text-gray-500">
                                  <span className="font-medium">Start:</span> {formatDate(training.start_date, false)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  <span className="font-medium">End:</span> {formatDate(training.end_date, false)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  <ElegantPagination
                    currentPage={trainingPage}
                    totalPages={totalTrainingPages}
                    onPageChange={setTrainingPage}
                    className="mt-6"
                  />
                </div>
              )}

              {/* Salary Slip Upload */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-[#662b1f] mb-6 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-3"></div>
                  Salary Slip
                </h3>
                
                <div className="flex flex-col items-center w-full">
                  {!file ? (
                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 ${
                        isDragOver
                          ? "border-[#662b1f] bg-gray-100"
                          : "border-gray-300"
                      } border-dashed rounded-lg cursor-pointer transition`}
                    >
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf"
                        className="hidden"
                      />
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FaUpload className="text-4xl mb-2" />
                        <span className="text-sm">Drag & drop your PDF here</span>
                        <span className="text-sm">or click to select a file</span>
                      </div>
                    </label>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full border border-gray-300 rounded-lg bg-white p-4 text-center">
                      <p className="text-sm text-gray-700 mb-2">
                        Selected file:{" "}
                        <span className="font-medium">{file.name}</span>
                      </p>
                      <div className="flex gap-4">
                        <label className="text-sm text-blue-600 cursor-pointer hover:underline">
                          Change file
                          <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf"
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove file
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleUpload}
                    disabled={isUploading || !file}
                    className="mt-4 w-full px-4 py-2 bg-[#662b1f] text-white rounded-lg hover:bg-[#8a3b2a] disabled:opacity-50 flex items-center justify-center gap-2 transition shadow-md"
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <FaUpload />
                    )}
                    Upload
                  </button>
                </div>

                {uploadMessage && (
                  <p
                    className={`mt-3 text-sm font-medium text-center ${
                      uploadMessage.includes("Failed")
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {uploadMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-lg">
            <p className="text-sm text-gray-600 font-medium">
              &copy; {new Date().getFullYear()} HR Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Info Card Component
const InfoCard = ({ icon, title, value, fullWidth = false, color = "default" }) => {
  const colorClasses = {
    default: "bg-[#662b1f]/10 text-[#662b1f]",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600"
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition duration-300 ${
      fullWidth ? "md:col-span-3" : ""
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            {title}
          </h3>
          <p className="text-gray-900 font-medium">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ icon, title, value, color = "default" }) => {
  const colorClasses = {
    default: "bg-[#662b1f]/5 border-[#662b1f]",
    green: "bg-green-50 border-green-500",
    blue: "bg-blue-50 border-blue-500",
    red: "bg-red-50 border-red-500"
  };

  const textClasses = {
    default: "text-[#662b1f]",
    green: "text-green-600",
    blue: "text-blue-600",
    red: "text-red-600"
  };

  return (
    <div className={`p-4 rounded-xl border-l-4 ${colorClasses[color]} shadow-sm hover:shadow-md transition duration-300`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color].replace('50', '100')}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            {title}
          </h3>
          <p className={`text-2xl font-bold ${textClasses[color]}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;