import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Download,
  UserCircle,
  Clock,
  Building,
  Mail,
  Phone,
  Search,
  Filter,
  Grid3X3,
  List,
  Users,
  Activity,
  ChevronDown,
  Plus,
  Eye,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";
import useDocumentTitle from "../../hooks/useDocumentTitle";

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(6);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await API.get("/api/hr/employee", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleClick = (id) => {
    navigate(`/user/${id}`);
  };

  const getInitialAvatar = (name) => {
    if (!name) return null;

    return (
      <div className="bg-gradient-to-br from-[#662b1f] to-[#8a3b2c] text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold uppercase shadow-md">
        {name.charAt(0)}
      </div>
    );
  };

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const groupedByDate = {};

    employees.forEach((emp) => {
      if (emp.attendanceRecords?.length > 0) {
        emp.attendanceRecords.forEach((record) => {
          const dateKey = record.checkIn
            ? new Date(record.checkIn).toISOString().split("T")[0]
            : "No Date";

          if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
          }

          groupedByDate[dateKey].push({
            Name: emp.username || "Unknown",
            JoinDate: emp.joint_date
              ? new Date(emp.joint_date).toLocaleDateString()
              : "No Join Date",
            Email: emp.email || "No Email",
            Phone: emp.phone_nmb || "No Phone",
            CheckIn: record.checkIn
              ? new Date(record.checkIn).toLocaleTimeString()
              : "—",
            CheckOut: record.checkOut
              ? new Date(record.checkOut).toLocaleTimeString()
              : "—",
            WorkHours: record.workHours || "—",
          });
        });
      }
    });

    for (const [date, rows] of Object.entries(groupedByDate)) {
      const sheet = workbook.addWorksheet(date);
      sheet.columns = [
        { header: "Name", key: "Name", width: 20 },
        { header: "Join Date", key: "JoinDate", width: 20 },
        { header: "Email", key: "Email", width: 25 },
        { header: "Phone", key: "Phone", width: 15 },
        { header: "CheckIn", key: "CheckIn", width: 15 },
        { header: "CheckOut", key: "CheckOut", width: 15 },
        { header: "WorkHours", key: "WorkHours", width: 15 },
      ];

      // Style header
      sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4F81BD" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });

      rows.forEach((row) => sheet.addRow(row));
      sheet.autoFilter = { from: "A1", to: "G1" };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "employee_attendance_by_day.xlsx");
  };

  const handleDeleteAllEmployees = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL employee accounts? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      await API.delete("/api/hr/deleteAllEmployees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees([]);
      alert("All employee accounts have been deleted successfully.");
    } catch (error) {
      console.error("Error deleting all employees:", error);
      alert("Failed to delete all employees. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmployeePhoto = (photo, username, size = "h-24 w-24") => {
    if (photo && photo !== "") {
      return (
        <img
          src={`${API.defaults.baseURL}${photo}`}
          alt={username}
          className={`${size} rounded-full object-cover border-2 border-white shadow-md`}
        />
      );
    } else {
      return (
        <div
          className={`${size} rounded-full bg-gradient-to-br from-[#662b1f] to-[#8a3b2c] text-white flex items-center justify-center text-xl font-bold uppercase shadow-md`}
        >
          {username?.charAt(0) || "?"}
        </div>
      );
    }
  };

  const formatTime = (timeString) => {
    if (!timeString || timeString === "—") return "—";

    try {
      const date = new Date(timeString);
      if (isNaN(date)) {
        console.error("Invalid date format:", timeString);
        return "Invalid time";
      }
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Error parsing date:", e);
      return "Invalid time";
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadStatus(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("error");
      return;
    }

    try {
      setIsProcessing(true);
      setUploadProgress(0);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("zipfile", selectedFile);

      const response = await API.post("/api/hr/upload-zip-slip", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setUploadStatus("success");
      setUploadResults(response.data.details);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setUploadResults(error.response?.data || { message: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // Department options for filter
  const departmentOptions = [
    "Production",
    "Engineering",
    "Sales",
    "Marketing",
    "Finance",
  ];

  // Enhanced filtering
  const filteredEmployees = employees.filter((emp) => {
    const departmentStr = emp.department || "";
    const matchesSearch =
      emp.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      departmentStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "all" || departmentStr === selectedDepartment;

    const latestAttendance =
      emp.attendanceRecords?.[emp.attendanceRecords.length - 1];
    const inTime = formatTime(latestAttendance?.checkIn);
    const outTime = formatTime(latestAttendance?.checkOut);
    const status = outTime === "—" && inTime !== "—" ? "active" : "inactive";
    const matchesStatus = selectedStatus === "all" || status === selectedStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Stats calculations
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((emp) => {
    const latestAttendance =
      emp.attendanceRecords?.[emp.attendanceRecords.length - 1];
    const inTime = formatTime(latestAttendance?.checkIn);
    const outTime = formatTime(latestAttendance?.checkOut);
    return outTime === "—" && inTime !== "—";
  }).length;

  // Pagination logic
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    // Calculate the range of pages to show (5 pages at a time)
    const getPageRange = () => {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      // Adjust if we're at the start or end
      if (currentPage <= 3) {
        endPage = Math.min(5, totalPages);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(totalPages - 4, 1);
      }

      return { startPage, endPage };
    };

    const { startPage, endPage } = getPageRange();
    const pages = [];

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center mt-8 space-x-1">
        {/* Previous button */}
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`p-2 rounded-md ${
            currentPage === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {startPage > 1 && (
            <button
              onClick={() => paginate(startPage - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              ...
            </button>
          )}

          {pages.map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium ${
                currentPage === number
                  ? "bg-[#662b1f] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-current={currentPage === number ? "page" : undefined}
            >
              {number}
            </button>
          ))}

          {endPage < totalPages && (
            <button
              onClick={() => paginate(endPage + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              ...
            </button>
          )}
        </div>

        {/* Next button */}
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-md ${
            currentPage === totalPages
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#662b1f]/5 to-orange-200/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Welcome Section */}
        <div className="relative bg-gradient-to-r from-[#662b1f] via-[#7d3420] to-[#8b3a1f] rounded-3xl p-8 mb-8 text-white shadow-2xl overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/3 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full mr-4"></div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                  Employee Management
                </h2>
                <div className="ml-3 animate-bounce">
                  <Users className="text-yellow-300" size={28} />
                </div>
              </div>
              <p className="text-white/90 text-lg font-medium mb-2">
                Manage your team members and track their attendance
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Users size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Control Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 mb-8">
          <div className="p-6 pb-4">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search name or email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-[#662b1f] transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Control Section */}
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-white text-[#662b1f] shadow-sm"
                        : "text-gray-600 hover:text-[#662b1f]"
                    }`}
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-white text-[#662b1f] shadow-sm"
                        : "text-gray-600 hover:text-[#662b1f]"
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Filter size={18} />
                  <span className="hidden sm:inline">Filters</span>
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Export Button */}
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#662b1f] to-[#8b3a1f] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </button>

                {/* Upload Salary Button */}
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <Upload size={16} />
                  <span className="hidden sm:inline">Upload Salary</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="px-6 pb-6 pt-2 border-t border-gray-200/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-[#662b1f]"
                  >
                    <option value="all">All Departments</option>
                    {departmentOptions.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-[#662b1f]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active (Checked In)</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete All Employees Button */}
        {/* <button
          onClick={handleDeleteAllEmployees}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
          disabled={isLoading || employees.length === 0}
          title={
            employees.length === 0
              ? "No employees to delete"
              : "Delete all employee accounts"
          }
        >
          <XCircle size={16} />
          <span className="hidden sm:inline">Delete All Employees</span>
        </button> */}

        

        {/* Results Summary */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/50 inline-block">
            <p className="text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {filteredEmployees.length > employeesPerPage
                  ? `${indexOfFirstEmployee + 1}-${Math.min(
                      indexOfLastEmployee,
                      filteredEmployees.length
                    )}`
                  : filteredEmployees.length > 0
                  ? `1-${filteredEmployees.length}`
                  : "0"}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {filteredEmployees.length}
              </span>{" "}
              employees •{" "}
              <span className="font-semibold text-green-600">
                {activeEmployees} active
              </span>{" "}
              today • Page{" "}
              <span className="font-semibold text-gray-900">
                {currentPage} of {totalPages}
              </span>
            </p>
          </div>
        </div>

        {/* Employee Grid/List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#662b1f]"></div>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentEmployees.map((emp) => {
                    const latestAttendance =
                      emp.attendanceRecords?.[emp.attendanceRecords.length - 1];
                    const inTime = formatTime(latestAttendance?.checkIn);
                    const outTime = formatTime(latestAttendance?.checkOut);
                    const status =
                      outTime === "—" && inTime !== "—" ? "active" : "inactive";

                    // Department color mapping
                    const deptColors = {
                      Production: { bg: "bg-blue-100", text: "text-blue-800" },
                      Engineering: {
                        bg: "bg-purple-100",
                        text: "text-purple-800",
                      },
                      Sales: { bg: "bg-green-100", text: "text-green-800" },
                      Marketing: { bg: "bg-pink-100", text: "text-pink-800" },
                      Finance: { bg: "bg-amber-100", text: "text-amber-800" },
                      default: { bg: "bg-gray-100", text: "text-gray-800" },
                    };
                    const deptStyle =
                      deptColors[emp.department] || deptColors.default;

                    return (
                      <div
                        key={emp._id}
                        className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                      >
                        {/* Status indicator */}
                        <div
                          className={`absolute top-3 right-3 z-10 w-2.5 h-2.5 rounded-full ${
                            status === "active"
                              ? "bg-emerald-500 animate-pulse ring-2 ring-emerald-200"
                              : "bg-gray-400"
                          }`}
                        ></div>

                        {/* Employee avatar - Larger size */}
                        <div className="relative h-48 bg-gray-50 flex items-center justify-center p-4">
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"></div>
                          <div className="relative z-10">
                            {renderEmployeePhoto(
                              emp.photo,
                              emp.username,
                              "h-32 w-32"
                            )}
                          </div>
                        </div>

                        {/* Employee info */}
                        <div className="p-5">
                          <div className="mb-3">
                            <h3 className="text-lg font-bold text-gray-900 truncate">
                              {emp.username}
                            </h3>
                            <div
                              className={`inline-flex items-center px-3 py-1 mt-2 rounded-md text-sm font-medium ${deptStyle.bg} ${deptStyle.text}`}
                            >
                              {emp.department || "No Department"}
                            </div>
                          </div>

                          {/* Contact info */}
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail
                                className="flex-shrink-0 mr-2 text-gray-500"
                                size={14}
                              />
                              <span className="truncate">
                                {emp.email || "No email"}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone
                                className="flex-shrink-0 mr-2 text-gray-500"
                                size={14}
                              />
                              <span>{emp.phone_nmb || "No phone"}</span>
                            </div>
                          </div>

                          {/* Attendance */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between">
                              <div className="text-center">
                                <div className="text-sm text-gray-500 font-medium">
                                  Check In
                                </div>
                                <div
                                  className={`mt-1 text-sm ${
                                    inTime !== "—"
                                      ? "text-gray-900 font-semibold"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {inTime}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-gray-500 font-medium">
                                  Check Out
                                </div>
                                <div
                                  className={`mt-1 text-sm ${
                                    outTime !== "—"
                                      ? "text-gray-900 font-semibold"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {outTime}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Hover action */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => handleClick(emp._id)}
                            className="bg-white px-4 py-2 rounded-md shadow-sm flex items-center text-sm font-medium text-[#662b1f] border border-gray-200 hover:border-[#662b1f] transition-all"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Pagination />
              </>
            ) : (
              <>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Check In/Out
                          </th>
                          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hours
                          </th>
                          <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentEmployees.map((emp) => {
                          const latestAttendance =
                            emp.attendanceRecords?.[
                              emp.attendanceRecords.length - 1
                            ];
                          const inTime = formatTime(latestAttendance?.checkIn);
                          const outTime = formatTime(
                            latestAttendance?.checkOut
                          );
                          const status =
                            outTime === "—" && inTime !== "—"
                              ? "active"
                              : "inactive";
                          const workHours = latestAttendance?.workHours || "—";

                          // Department color coding
                          const departmentColors = {
                            Production: "bg-blue-100 text-blue-800",
                            Engineering: "bg-purple-100 text-purple-800",
                            Sales: "bg-green-100 text-green-800",
                            Marketing: "bg-pink-100 text-pink-800",
                            Finance: "bg-amber-100 text-amber-800",
                            default: "bg-gray-100 text-gray-800",
                          };

                          const deptColor =
                            departmentColors[emp.department] ||
                            departmentColors.default;

                          return (
                            <tr
                              key={emp._id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <div className="relative flex-shrink-0 mr-3">
                                    {renderEmployeePhoto(
                                      emp.photo,
                                      emp.username,
                                      "h-8 w-8"
                                    )}
                                    <div
                                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                                        status === "active"
                                          ? "bg-emerald-500 animate-pulse"
                                          : "bg-gray-400"
                                      }`}
                                    ></div>
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      {emp.username}
                                    </div>
                                    <div className="text-xs text-gray-500 break-all">
                                      {emp.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3 min-w-[120px]">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${deptColor} whitespace-normal`}
                                >
                                  {emp.department || "—"}
                                </span>
                              </td>
                              <td className="px-2 py-3 whitespace-nowrap">
                                <div
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                                    status === "active"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                      status === "active"
                                        ? "bg-emerald-500 animate-pulse"
                                        : "bg-gray-400"
                                    }`}
                                  ></span>
                                  {status === "active" ? "Active" : "Inactive"}
                                </div>
                              </td>
                              <td className="px-2 py-3 whitespace-nowrap">
                                <div className="text-xs">
                                  <div className="flex items-center">
                                    <span
                                      className={`${
                                        inTime !== "—"
                                          ? "text-gray-900"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      {inTime}
                                    </span>
                                  </div>
                                  <div className="flex items-center mt-1">
                                    <span
                                      className={`${
                                        outTime !== "—"
                                          ? "text-gray-900"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      {outTime}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 py-3 whitespace-nowrap">
                                <div className="text-xs font-medium">
                                  {workHours !== "—" ? `${workHours}h` : "—"}
                                </div>
                              </td>
                              <td className="px-2 py-3 whitespace-nowrap">
                                <button
                                  onClick={() => handleClick(emp._id)}
                                  className="text-xs text-[#662b1f] hover:text-[#8b3a1f] font-medium flex items-center"
                                >
                                  View{" "}
                                  <ChevronRight size={12} className="ml-0.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <Pagination />
              </>
            )}
          </>
        )}

        {/* Enhanced Footer */}
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

      {/* Salary Upload Modal - This will now appear as a popup */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* Perubahan utama: menambah max-w-2xl dan menyesuaikan padding */}
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all duration-300 ease-in-out">
            {/* Header */}
            <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Upload Salary Slips
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setUploadStatus(null);
                  setUploadProgress(0);
                }}
                className="text-gray-400 hover:text-gray-500 p-1 -mr-2"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content - Tambah padding dan perbesar area konten */}
            <div className="p-8 space-y-6">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = "copy";
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const file = e.dataTransfer.files[0];
                  if (file.type === "application/x-zip-compressed" || file.name.endsWith(".zip")) {
                    setSelectedFile(file);
                    setUploadStatus(null);
                    e.dataTransfer.clearData();
                  } else {
                    alert("Please drop a valid ZIP file.");
                  }
                }
              }}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <UploadCloud size={60} className="text-blue-500" />
                <p className="text-base text-gray-600">
                  {selectedFile
                    ? selectedFile.name
                    : "Drag & drop your ZIP file here or click to browse"}
                </p>
                <label className="cursor-pointer mt-4">
                  <span className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block text-base">
                    Select File
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".zip"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

              {/* Perbesar area instruksi */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 text-lg">
                  Instructions:
                </h4>
                <ul className="text-base text-gray-600 space-y-2 list-disc pl-6">
                  <li>Upload a ZIP file containing PDF salary slips</li>
                  <li>Format nama file: Salary_Month.zip</li>
                  <li>Format nama PDF: Salary_employee name.pdf</li>
                  <li>Ukuran maksimal: 50MB</li>
                </ul>
              </div>

              {uploadProgress > 0 && (
                <div className="space-y-3">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        uploadStatus === "error"
                          ? "bg-red-500"
                          : uploadStatus === "success"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 text-right">
                    {uploadProgress}%{" "}
                    {uploadStatus === "success" ? "Completed!" : "Uploading..."}
                  </p>
                </div>
              )}

              {uploadStatus === "error" && (
                <div className="flex items-center text-red-500 text-base">
                  <AlertCircle className="mr-2" size={20} />
                  <span>Upload failed. Please try again.</span>
                </div>
              )}

              {uploadStatus === "success" && (
                <div className="flex items-center text-green-500 text-base">
                  <CheckCircle className="mr-2" size={20} />
                  <span>Upload successful!</span>
                </div>
              )}
            </div>

            {/* Footer - Perbesar padding dan tombol */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setUploadStatus(null);
                    setUploadProgress(0);
                  }}
                  className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium rounded-lg text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={
                    !selectedFile || isProcessing || uploadStatus === "success"
                  }
                  className={`px-6 py-2.5 rounded-lg font-medium text-base ${
                    !selectedFile || isProcessing || uploadStatus === "success"
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isProcessing
                    ? "Processing..."
                    : uploadStatus === "success"
                    ? "Done"
                    : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeesPage;
