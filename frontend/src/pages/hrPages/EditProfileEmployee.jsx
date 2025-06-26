import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaIdCard,
  FaMapMarkerAlt,
  FaAddressCard,
  FaHospital,
  FaShieldAlt,
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaCamera,
  FaGraduationCap,
  FaCertificate,
  FaPlus,
  FaTrash,
  FaEdit,
  FaBuilding,
} from "react-icons/fa";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditProfileEmployee() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  useDocumentTitle("Edit Employee Profile");

  const [formData, setFormData] = useState({
    username: "",
    employee_name: "",
    nik: "",
    email: "",
    phone_nmb: "",
    gender: "",
    dob: "",
    pob: "",
    ktp_number: "",
    kk_number: "",
    npwp_number: "",
    ktp_address: "",
    joint_date: "",
    contract_end_date: "",
    department: "",
    bpjs_kesehatan_no: "",
    bpjs_clinic: "",
    bpjs_tk_no: "",
    bpjs_jp_no: "",
    educationHistory: [
      {
        last_education: "",
        institution: "",
        majority: "",
        year_of_graduation: "",
      },
    ],
    trainingHistory: [
      {
        title: "",
        provider: "",
        start_date: "",
        end_date: "",
      },
    ],
    leaveInfo: {
      totalAnnualLeave: 12,
      usedAnnualLeave: 0,
      remainingAnnualLeave: 12,
    },
  });

  // Education level options
  const educationLevels = ["SMA SEDERAJAT", "SMK SEDERAJAT", "S1"];

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
          // Format dates for input fields
          const formatDateForInput = (dateString) => {
            if (!dateString) return "";
            return new Date(dateString).toISOString().split("T")[0];
          };

          setFormData({
            username: found.username || "",
            employee_name: found.employee_name || "",
            nik: found.nik || "",
            email: found.email || "",
            phone_nmb: found.phone_nmb || "",
            gender: found.gender || "",
            dob: formatDateForInput(found.dob),
            pob: found.pob || "",
            ktp_number: found.ktp_number || "",
            kk_number: found.kk_number || "",
            npwp_number: found.npwp_number || "",
            ktp_address: found.ktp_address || "",
            joint_date: formatDateForInput(found.joint_date),
            contract_end_date: formatDateForInput(found.contract_end_date),
            department: found.department || "",
            bpjs_kesehatan_no: found.bpjs_kesehatan_no || "",
            bpjs_clinic: found.bpjs_clinic || "",
            bpjs_tk_no: found.bpjs_tk_no || "",
            bpjs_jp_no: found.bpjs_jp_no || "",
            educationHistory: found.educationHistory || [],
            trainingHistory: found.trainingHistory || [],
            leaveInfo: {
              totalAnnualLeave: found.leaveInfo?.totalAnnualLeave || 12,
              usedAnnualLeave: found.leaveInfo?.usedAnnualLeave || 0,
              remainingAnnualLeave: found.leaveInfo?.remainingAnnualLeave || 12,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
        toast.error("Error fetching employee data");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLeaveInfoChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => {
      const newLeaveInfo = { ...prev.leaveInfo };

      if (field === "totalAnnualLeave") {
        newLeaveInfo.totalAnnualLeave = numValue;
        // Auto calculate remaining leave
        newLeaveInfo.remainingAnnualLeave =
          numValue - newLeaveInfo.usedAnnualLeave;
      } else if (field === "usedAnnualLeave") {
        newLeaveInfo.usedAnnualLeave = numValue;
        // Auto calculate remaining leave
        newLeaveInfo.remainingAnnualLeave =
          newLeaveInfo.totalAnnualLeave - numValue;
      }

      return { ...prev, leaveInfo: newLeaveInfo };
    });
  };

  const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    const newEducation = [...formData.educationHistory];
    newEducation[index][name] = value;
    setFormData({ ...formData, educationHistory: newEducation });
  };

  const handleTrainingChange = (index, e) => {
    const { name, value } = e.target;
    const newTraining = [...formData.trainingHistory];
    newTraining[index][name] = value;
    setFormData({ ...formData, trainingHistory: newTraining });
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      educationHistory: [
        ...prev.educationHistory,
        {
          last_education: "",
          institution: "",
          majority: "",
          year_of_graduation: "",
        },
      ],
    }));
  };

  const removeEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      educationHistory: prev.educationHistory.filter((_, i) => i !== index),
    }));
  };

  const addTraining = () => {
    setFormData((prev) => ({
      ...prev,
      trainingHistory: [
        ...prev.trainingHistory,
        { title: "", provider: "", start_date: "", end_date: "" },
      ],
    }));
  };

  const removeTraining = (index) => {
    setFormData((prev) => ({
      ...prev,
      trainingHistory: prev.trainingHistory.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const form = new FormData();

      // Validasi isi pendidikan
      const cleanedEducationHistory = formData.educationHistory.filter(
        (edu) =>
          edu.last_education &&
          edu.institution &&
          edu.majority &&
          edu.year_of_graduation
      );

      // Validasi isi pelatihan
      const cleanedTrainingHistory = formData.trainingHistory.filter(
        (tr) => tr.title && tr.provider && tr.start_date && tr.end_date
      );

      // Tambahkan semua field ke FormData
      Object.entries({
        ...formData,
        educationHistory: cleanedEducationHistory,
        trainingHistory: cleanedTrainingHistory,
        leaveInfo: formData.leaveInfo,
      }).forEach(([key, value]) => {
        if (
          key === "educationHistory" ||
          key === "trainingHistory" ||
          key === "leaveInfo"
        ) {
          form.append(key, JSON.stringify(value));
        } else {
          form.append(key, value);
        }
      });

      if (selectedFile) {
        form.append("file", selectedFile);
      }

      const response = await API.put(`/api/hr/employee/edit/${id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Employee updated successfully");
      navigate(-1);
    } catch (error) {
      console.error("Error updating employee:", error);
      if (error.response) {
        toast.error(
          `Failed to update employee: ${
            error.response.data.message || "Unknown error"
          }`
        );
      } else if (error.request) {
        toast.error("Failed to update employee: Cannot connect to server");
      } else {
        toast.error(`Failed to update employee: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#662b1f] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading employee data...
          </p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Employee Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The requested employee profile could not be located.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-[#662b1f] to-[#8a3b2a] text-white rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
          >
            <FaArrowLeft className="inline mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 sm:p-6">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#662b1f]/5 to-orange-200/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-[#662b1f] via-[#7d3420] to-[#8b3a1f] rounded-2xl p-6 mb-6 text-white shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/3 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex-1 mb-4 sm:mb-0">
              <div className="flex items-center mb-3">
                <div className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full mr-4"></div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                  Edit Employee Profile
                </h2>
              </div>
              <p className="text-white/90 text-sm sm:text-base font-medium">
                {employee.employee_name}
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition font-medium flex items-center gap-2 backdrop-blur-sm border border-white/20"
            >
              <FaTimes /> Cancel
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 mb-6">
          <form onSubmit={handleSubmit}>
            {/* Profile Picture Section */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-[#662b1f] mb-4 border-b pb-2 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-3"></div>
                Profile Picture
              </h4>
              <div className="flex flex-col items-center">
                <div className="relative group">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#662b1f] shadow-lg group-hover:opacity-90 transition-opacity"
                    />
                  ) : employee.photo ? (
                    <img
                      src={`${API.defaults.baseURL}${employee.photo}`}
                      alt={employee.username}
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#662b1f] shadow-lg group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-[#662b1f] to-[#8a3b2a] text-white w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold uppercase shadow-lg group-hover:opacity-90 transition-opacity">
                      {employee.username?.charAt(0)}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-full cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg">
                    <FaCamera />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Click camera icon to change photo
                </p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-[#662b1f] mb-4 border-b pb-2 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-3"></div>
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaUser className="mr-2 text-[#662b1f]" />
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaBuilding className="mr-2 text-[#662b1f]" />
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  >
                    <option value="">Select Department</option>
                    <option value="Production">Production</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaUser className="mr-2 text-[#662b1f]" />
                    Employee Name
                  </label>
                  <input
                    type="text"
                    name="employee_name"
                    value={formData.employee_name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaIdCard className="mr-2 text-[#662b1f]" />
                    NIK
                  </label>
                  <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaEnvelope className="mr-2 text-[#662b1f]" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaPhone className="mr-2 text-[#662b1f]" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_nmb"
                    value={formData.phone_nmb}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaUser className="mr-2 text-[#662b1f]" />
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaCalendarAlt className="mr-2 text-[#662b1f]" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-[#662b1f]" />
                    Place of Birth
                  </label>
                  <input
                    type="text"
                    name="pob"
                    value={formData.pob}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  />
                </div>

                <div className="md:col-span-2 group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaAddressCard className="mr-2 text-[#662b1f]" />
                    KTP Address
                  </label>
                  <textarea
                    name="ktp_address"
                    value={formData.ktp_address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-[#662b1f] mb-4 border-b pb-2 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-3"></div>
                Employment Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaCalendarAlt className="mr-2 text-[#662b1f]" />
                    Join Date
                  </label>
                  <input
                    type="date"
                    name="joint_date"
                    value={formData.joint_date}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaCalendarAlt className="mr-2 text-[#662b1f]" />
                    Contract End Date
                  </label>
                  <input
                    type="date"
                    name="contract_end_date"
                    value={formData.contract_end_date}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* ID Numbers */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-[#662b1f] mb-4 border-b pb-2 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-3"></div>
                ID Numbers
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaIdCard className="mr-2 text-[#662b1f]" />
                    KTP Number
                  </label>
                  <input
                    type="text"
                    name="ktp_number"
                    value={formData.ktp_number}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaIdCard className="mr-2 text-[#662b1f]" />
                    KK Number
                  </label>
                  <input
                    type="text"
                    name="kk_number"
                    value={formData.kk_number}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaIdCard className="mr-2 text-[#662b1f]" />
                    NPWP Number
                  </label>
                  <input
                    type="text"
                    name="npwp_number"
                    value={formData.npwp_number}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* BPJS Information */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-[#662b1f] mb-4 border-b pb-2 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-3"></div>
                BPJS Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaHospital className="mr-2 text-[#662b1f]" />
                    BPJS Kesehatan No
                  </label>
                  <input
                    type="text"
                    name="bpjs_kesehatan_no"
                    value={formData.bpjs_kesehatan_no}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaShieldAlt className="mr-2 text-[#662b1f]" />
                    BPJS Clinic
                  </label>
                  <input
                    type="text"
                    name="bpjs_clinic"
                    value={formData.bpjs_clinic}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaShieldAlt className="mr-2 text-[#662b1f]" />
                    BPJS TK No
                  </label>
                  <input
                    type="text"
                    name="bpjs_tk_no"
                    value={formData.bpjs_tk_no}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaShieldAlt className="mr-2 text-[#662b1f]" />
                    BPJS JP No
                  </label>
                  <input
                    type="text"
                    name="bpjs_jp_no"
                    value={formData.bpjs_jp_no}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Education History */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#662b1f] rounded-lg flex items-center justify-center mr-3">
                    <FaGraduationCap className="text-white text-sm" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Education History
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addEducation}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaPlus className="text-sm" />
                  Add Education
                </button>
              </div>

              <div className="space-y-6">
                {formData.educationHistory.map((edu, index) => (
                  <div
                    key={index}
                    className="relative bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {/* Tombol hapus di pojok kanan atas */}
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors duration-200"
                      title="Delete this education"
                    >
                      <FaTrash className="text-lg" />
                    </button>

                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-gray-700 flex items-center">
                        <FaGraduationCap className="mr-2 text-[#662b1f]" />
                        Education #{index + 1}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Education Level
                        </label>
                        <select
                          name="last_education"
                          value={edu.last_education}
                          onChange={(e) => handleEducationChange(index, e)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                        >
                          <option value="">Select Education Level</option>
                          {educationLevels.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Institution
                        </label>
                        <input
                          type="text"
                          name="institution"
                          placeholder="Enter institution name"
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(index, e)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Major/Field of Study
                        </label>
                        <input
                          type="text"
                          name="majority"
                          placeholder="Enter major or field of study"
                          value={edu.majority}
                          onChange={(e) => handleEducationChange(index, e)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Year of Graduation
                        </label>
                        <input
                          type="number"
                          name="year_of_graduation"
                          placeholder="e.g., 2020"
                          min="1970"
                          max="2030"
                          value={edu.year_of_graduation}
                          onChange={(e) => handleEducationChange(index, e)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Training History */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#662b1f] rounded-lg flex items-center justify-center mr-3">
                    <FaCertificate className="text-white text-sm" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Training History
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addTraining}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaPlus className="text-sm" />
                  Add Training
                </button>
              </div>

              <div className="space-y-6">
                {formData.trainingHistory.map((train, index) => (
                  <div
                    key={index}
                    className="relative bg-gradient-to-r from-gray-50 to-green-50 p-6 rounded-2xl border-2 border-gray-100 hover:border-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {/* Tombol hapus di pojok kanan atas */}
                    <button
                      type="button"
                      onClick={() => removeTraining(index)}
                      className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors duration-200"
                      title="Delete this training"
                    >
                      <FaTrash className="text-lg" />
                    </button>

                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-gray-700 flex items-center">
                        <FaCertificate className="mr-2 text-[#662b1f]" />
                        Training #{index + 1}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Training Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          placeholder="Enter training title"
                          value={train.title}
                          onChange={(e) => handleTrainingChange(index, e)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Training Provider
                        </label>
                        <input
                          type="text"
                          name="provider"
                          placeholder="Enter provider/organizer"
                          value={train.provider}
                          onChange={(e) => handleTrainingChange(index, e)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="start_date"
                          value={train.start_date}
                          onChange={(e) => handleTrainingChange(index, e)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          name="end_date"
                          value={train.end_date}
                          onChange={(e) => handleTrainingChange(index, e)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#662b1f] mb-4 border-b pb-2 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-3"></div>
                <FaCalendarAlt className="mr-2" />
                Leave Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Annual Leave */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Annual Leave (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={formData.leaveInfo.totalAnnualLeave}
                    onChange={(e) =>
                      handleLeaveInfoChange("totalAnnualLeave", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-transparent transition-all group-hover:border-gray-400"
                  />
                </div>

                
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200/50">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-[#662b1f] to-[#8a3b2a] text-white rounded-xl hover:opacity-90 transition-all duration-300 font-medium flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                <FaSave /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfileEmployee;
