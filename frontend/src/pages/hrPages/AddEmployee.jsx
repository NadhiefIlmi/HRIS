import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../api/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  User,
  CreditCard,
  Calendar,
  Lock,
  Mail,
  Phone,
  MapPin,
  Building,
  ChevronRight,
  Plus,
  AlertCircle,
  BookOpen,
  Award,
  ChevronDown,
  Briefcase,
  Trash2,
} from "lucide-react";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const InputField = ({ label, icon, ...props }) => (
  <div className="mb-4">
    <label className="text-sm font-medium text-gray-700 block mb-1">
      {label} {props.required && <span className="text-[#a8441f]">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {React.cloneElement(icon, { size: 18, className: "text-gray-500" })}
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200/70 rounded-xl focus:ring-2 focus:ring-[#662b1f]/50 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:shadow-md"
      />
    </div>
  </div>
);

const tabComponents = {
  basic: BasicInfoTab,
  personal: PersonalInfoTab,
  employment: EmploymentInfoTab,
  documents: DocumentsTab,
  education: EducationTab,
  training: TrainingTab,
};

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    username: "",
    nik: "",
    employee_name: "",
    department: "",
    joint_date: "",
    contract_end_date: "",
    dob: "",
    pob: "",
    ktp_number: "",
    kk_number: "",
    npwp_number: "",
    gender: "male",
    phone_nmb: "",
    email: "",
    password: "",
    photo: null,
    educationHistory: [],
    trainingHistory: [],
    leaveInfo: {
      totalAnnualLeave: 12,
    },
    bpjs_kesehatan_no: "",
    bpjs_clinic: "",
    bpjs_tk_no: "",
    bpjs_jp_no: "",
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Define removeEducation function inside AddEmployee component scope
  const removeEducation = (index) => {
    setFormData((prev) => {
      const updatedEducation = [...prev.educationHistory];
      updatedEducation.splice(index, 1);
      return { ...prev, educationHistory: updatedEducation };
    });
  };

  const removeTraining = (index) => {
    setFormData((prev) => {
      const updatedTraining = [...prev.trainingHistory];
      updatedTraining.splice(index, 1);
      return { ...prev, trainingHistory: updatedTraining };
    });
  };


  useDocumentTitle("Add New Employee");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLeaveInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      leaveInfo: {
        ...prev.leaveInfo,
        [name]: value,
      },
    }));
  };

  const handlePhotoChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      photo: e.target.files[0] || null,
    }));
  };

  const validateFields = () => {
    const requiredFields = [
      "username",
      "nik",
      "employee_name",
      "joint_date",
      "dob",
      "gender",
      "password",
      "email",
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill all required fields: ${missingFields.join(", ")}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "educationHistory" || key === "trainingHistory") {
          data.append(key, JSON.stringify(value || []));
        } else if (key === "leaveInfo") {
          data.append(key, JSON.stringify(value || {}));
        } else if (key === "photo") {
          if (value) data.append("photo", value);
        } else {
          data.append(key, value);
        }
      });

      const response = await API.post("/api/employee/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(response.data.message || "Employee registered successfully");
      setTimeout(() => {
        navigate("/employees");
      }, 1500);
    } catch (error) {
      if (error.response) {
        toast.error(
          `Error: ${error.response.data.message || "Failed to register"}`
        );
      } else {
        toast.error("Network error or server not responding");
      }
    } finally {
      setLoading(false);
    }
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

  const addTraining = () => {
    setFormData((prev) => ({
      ...prev,
      trainingHistory: [
        ...prev.trainingHistory,
        { title: "", provider: "", start_date: "", end_date: "" },
      ],
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.educationHistory];
    updatedEducation[index][field] = value;
    setFormData((prev) => ({ ...prev, educationHistory: updatedEducation }));
  };

  const handleTrainingChange = (index, field, value) => {
    const updatedTraining = [...formData.trainingHistory];
    updatedTraining[index][field] = value;
    setFormData((prev) => ({ ...prev, trainingHistory: updatedTraining }));
  };

  const ActiveTabComponent = tabComponents[activeTab];

  return (
    <div className="min-h-screen from-slate-50 via-blue-50/30 to-indigo-50/40 py-8 px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#662b1f]/5 to-orange-200/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-[#662b1f] via-[#7d3420] to-[#8b3a1f] rounded-3xl p-6 mb-8 text-white shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full mr-4"></div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                  Add New Employee
                </h2>
              </div>
              <p className="text-white/90 text-base font-medium">
                Complete the form to register a new employee to the system
              </p>
            </div>
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <User size={32} className="text-white/90" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
          {/* Form Navigation */}
          <div className="border-b border-gray-200/50">
            <div className="flex overflow-x-auto">
              {["basic", "personal", "employment", "documents", "education", "training"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? "text-[#662b1f] border-b-2 border-[#662b1f] font-bold"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50 font-normal"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <ToastContainer position="top-right" autoClose={3000} />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === "basic" ? 0 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <ActiveTabComponent 
                  formData={formData}
                  handleChange={handleChange}
                  handlePhotoChange={handlePhotoChange}
                  handleLeaveInfoChange={handleLeaveInfoChange}
                  addEducation={addEducation}
                  addTraining={addTraining}
                  handleEducationChange={handleEducationChange}
                  handleTrainingChange={handleTrainingChange}
                  removeEducation={removeEducation}
                  removeTraining={removeTraining}
                />
              </motion.div>
            </AnimatePresence>

            {/* Submit Button - shown on all tabs */}
            <div className="mt-12 pt-6 border-t border-gray-200/50">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] text-white hover:shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Register Employee"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Tab Components
function BasicInfoTab({ formData, handleChange, handlePhotoChange }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
        <User className="mr-3 text-[#662b1f]" size={20} />
        Basic Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0">
        <InputField
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          icon={<User />}
          placeholder="Enter username"
        />

        <InputField
          label="Employee Name"
          name="employee_name"
          value={formData.employee_name}
          onChange={handleChange}
          required
          icon={<User />}
          placeholder="Enter full name"
        />

        <InputField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          icon={<Mail />}
          placeholder="Enter email"
        />

        <InputField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          icon={<Lock />}
          placeholder="Enter password"
        />

        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Photo
          </label>
          <div className="flex items-center">
            <label className="cursor-pointer">
              <div className="px-4 py-3 bg-white border border-gray-200/70 rounded-xl hover:shadow-md transition-all duration-200 flex items-center">
                <span className="text-gray-600 mr-2">Choose file</span>
                <Plus size={16} className="text-[#662b1f]" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
            {formData.photo && (
              <div className="ml-4 flex items-center">
                <img
                  alt="Preview"
                  src={URL.createObjectURL(formData.photo)}
                  className="h-12 w-12 object-cover rounded-lg border border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {formData.photo.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonalInfoTab({ formData, handleChange }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
        <User className="mr-3 text-[#662b1f]" size={20} />
        Personal Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0">
        <InputField
          label="Date of Birth"
          name="dob"
          type="date"
          value={formData.dob}
          onChange={handleChange}
          required
          icon={<Calendar />}
        />

        <InputField
          label="Place of Birth"
          name="pob"
          value={formData.pob}
          onChange={handleChange}
          icon={<MapPin />}
          placeholder="Enter place of birth"
        />

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Gender <span className="text-[#a8441f]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-gray-500" />
            </div>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200/70 rounded-xl focus:ring-2 focus:ring-[#662b1f]/50 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <InputField
          label="Phone Number"
          name="phone_nmb"
          value={formData.phone_nmb}
          onChange={handleChange}
          icon={<Phone />}
          placeholder="Enter phone number"
        />
      </div>
    </div>
  );
}

function EmploymentInfoTab({ formData, handleChange, handleLeaveInfoChange }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
        <Briefcase className="mr-3 text-[#662b1f]" size={20} />
        Employment Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0">
        <InputField
          label="NIK"
          name="nik"
          value={formData.nik}
          onChange={handleChange}
          required
          icon={<CreditCard />}
          placeholder="Enter National ID"
        />

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Department
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building size={18} className="text-gray-500" />
            </div>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200/70 rounded-xl focus:ring-2 focus:ring-[#662b1f]/50 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <option value="">Select Department</option>
              <option value="Production">Production</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>

        <InputField
          label="Join Date"
          name="joint_date"
          type="date"
          value={formData.joint_date}
          onChange={handleChange}
          required
          icon={<Calendar />}
        />

        <InputField
          label="Contract End Date"
          name="contract_end_date"
          type="date"
          value={formData.contract_end_date}
          onChange={handleChange}
          icon={<Calendar />}
        />

        <InputField
          label="Total Annual Leave"
          name="totalAnnualLeave"
          type="number"
          min="0"
          value={formData.leaveInfo.totalAnnualLeave}
          onChange={handleLeaveInfoChange}
          icon={<Calendar />}
          placeholder="Enter total annual leave"
        />
      </div>
    </div>
  );
}

function DocumentsTab({ formData, handleChange }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
        <CreditCard className="mr-3 text-[#662b1f]" size={20} />
        Documents
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0">
        <InputField
          label="KTP Number"
          name="ktp_number"
          value={formData.ktp_number}
          onChange={handleChange}
          icon={<CreditCard />}
          placeholder="Enter KTP number"
        />

        <InputField
          label="KK Number"
          name="kk_number"
          value={formData.kk_number}
          onChange={handleChange}
          icon={<CreditCard />}
          placeholder="Enter KK number"
        />

        <InputField
          label="NPWP Number"
          name="npwp_number"
          value={formData.npwp_number}
          onChange={handleChange}
          icon={<CreditCard />}
          placeholder="Enter NPWP number"
        />

        <InputField
          label="BPJS Kesehatan Number"
          name="bpjs_kesehatan_no"
          value={formData.bpjs_kesehatan_no}
          onChange={handleChange}
          icon={<CreditCard />}
          placeholder="Enter BPJS Kesehatan Number"
        />

        <InputField
          label="BPJS Clinic"
          name="bpjs_clinic"
          value={formData.bpjs_clinic}
          onChange={handleChange}
          icon={<CreditCard />}
          placeholder="Enter BPJS Clinic"
        />

        <InputField
          label="BPJS TK Number"
          name="bpjs_tk_no"
          value={formData.bpjs_tk_no}
          onChange={handleChange}
          icon={<CreditCard />}
          placeholder="Enter BPJS TK Number"
        />

        <InputField
          label="BPJS JP Number"
          name="bpjs_jp_no"
          value={formData.bpjs_jp_no}
          onChange={handleChange}
          icon={<CreditCard />}
          placeholder="Enter BPJS JP Number"
        />
      </div>
    </div>
  );
}

function EducationTab({ formData, addEducation, handleEducationChange, removeEducation }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
        <BookOpen className="mr-3 text-[#662b1f]" size={20} />
        Education History
      </h3>

      <div className="pl-0">
        {formData.educationHistory.length === 0 && (
          <div className="mb-6 p-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-300 text-center">
            <BookOpen className="mx-auto text-gray-400" size={24} />
            <p className="mt-2 text-gray-500">
              No education history added yet
            </p>
          </div>
        )}

              {formData.educationHistory.map((edu, idx) => (
                <div
                  key={idx}
                  className="mb-6 p-6 bg-white rounded-xl border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow relative"
                >
                  <button
                    type="button"
                    onClick={() => removeEducation(idx)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                    aria-label="Remove education entry"
                  >
                    <Trash2 size={20} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Last Education
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BookOpen size={18} className="text-gray-500" />
                        </div>
                        <select
                          value={edu.last_education}
                          onChange={(e) =>
                            handleEducationChange(
                              idx,
                              "last_education",
                              e.target.value
                            )
                          }
                          className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200/70 rounded-xl focus:ring-2 focus:ring-[#662b1f]/50 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
                        >
                          <option value="">Select Last Education</option>
                          <option value="SMK SEDERAJAT">SMK SEDERAJAT</option>
                          <option value="SMA SEDERAJAT">SMA SEDERAJAT</option>
                          <option value="S1">S1</option>
                        </select>
                      </div>
                    </div>
                    <InputField
                      label="Institution"
                      value={edu.institution}
                      onChange={(e) =>
                        handleEducationChange(
                          idx,
                          "institution",
                          e.target.value
                        )
                      }
                      icon={<Building />}
                      placeholder="Enter institution name"
                    />
                    <InputField
                      label="Majority"
                      value={edu.majority}
                      onChange={(e) =>
                        handleEducationChange(
                          idx,
                          "majority",
                          e.target.value
                        )
                      }
                      icon={<BookOpen />}
                      placeholder="Enter majority/field"
                    />
                    <InputField
                      label="Year of Graduation"
                      type="number"
                      value={edu.year_of_graduation}
                      onChange={(e) =>
                        handleEducationChange(
                          idx,
                          "year_of_graduation",
                          e.target.value
                        )
                      }
                      icon={<Calendar />}
                      placeholder="Enter graduation year"
                    />
                  </div>
                </div>
              ))}

        <button
          type="button"
          onClick={addEducation}
          className="flex items-center px-5 py-3 rounded-xl bg-[#662b1f] text-white hover:bg-[#8a3b2d] transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add Education
        </button>
      </div>
    </div>
  );
}

function TrainingTab({ formData, addTraining, handleTrainingChange, removeTraining }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
        <Award className="mr-3 text-[#662b1f]" size={20} />
        Training History
      </h3>

      <div className="pl-0">
        {formData.trainingHistory.length === 0 && (
          <div className="mb-6 p-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-300 text-center">
            <Award className="mx-auto text-gray-400" size={24} />
            <p className="mt-2 text-gray-500">
              No training history added yet
            </p>
          </div>
        )}

        {formData.trainingHistory.map((training, idx) => (
          <div
            key={idx}
            className="mb-6 p-6 bg-white rounded-xl border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow relative"
          >
            <button
              type="button"
              onClick={() => removeTraining(idx)}
              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              aria-label="Remove training entry"
            >
              <Trash2 size={20} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Training Name"
                value={training.title}
                onChange={(e) =>
                  handleTrainingChange(idx, "title", e.target.value)
                }
                icon={<Award />}
                placeholder="Enter training name"
              />

              <InputField
                label="Organizer"
                value={training.provider}
                onChange={(e) =>
                  handleTrainingChange(idx, "provider", e.target.value)
                }
                icon={<Building />}
                placeholder="Enter organizer name"
              />

              <InputField
                label="Start Date"
                type="date"
                value={training.start_date}
                onChange={(e) =>
                  handleTrainingChange(
                    idx,
                    "start_date",
                    e.target.value
                  )
                }
                icon={<Calendar />}
              />

              <InputField
                label="End Date"
                type="date"
                value={training.end_date}
                onChange={(e) =>
                  handleTrainingChange(
                    idx,
                    "end_date",
                    e.target.value
                  )
                }
                icon={<Calendar />}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addTraining}
          className="flex items-center px-5 py-3 rounded-xl bg-[#662b1f] text-white hover:bg-[#8a3b2d] transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add Training
        </button>
      </div>
    </div>
  );
}

export default AddEmployee;