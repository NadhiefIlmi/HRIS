import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import {
  Camera,
  Loader2,
  Save,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  ChevronRight,
  X,
  Key,
} from "lucide-react";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { toast } from "react-toastify";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { motion } from "framer-motion";

function ProfileEmployee() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const cropperRef = useRef(null);
  const [croppedImage, setCroppedImage] = useState(null);

  useDocumentTitle("My Profile");

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

  const handleChangePasswordClick = () => {
    navigate("/change-password");
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/employee/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProfile(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      }
      toast.error(err.response?.data?.message || "Failed to load profile", {
        position: "top-right",
      });
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        setShowImageModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleCrop = () => {
    if (cropperRef.current) {
      const cropper = cropperRef.current.cropper;
      setCroppedImage(cropper.getCroppedCanvas().toDataURL());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!cropperRef.current) {
        throw new Error("Cropper not initialized");
      }

      const cropper = cropperRef.current.cropper;
      const canvas = cropper.getCroppedCanvas();

      if (!canvas) {
        throw new Error("Cropping failed");
      }

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            throw new Error("Canvas to blob conversion failed");
          }

          const formData = new FormData();
          const file = new File([blob], "profile.jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          formData.append("file", file);

          try {
            const res = await API.put("/api/employee/edit", formData, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "multipart/form-data",
              },
            });

            setProfile(res.data.employee);
            closeModal();
            toast.success("Profile photo updated successfully!", {
              position: "top-right",
            });
          } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Update failed", {
              position: "top-right",
            });
          } finally {
            setSaving(false);
          }
        },
        "image/jpeg",
        0.9
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error processing image", {
        position: "top-right",
      });
      setSaving(false);
    }
  };

  const closeModal = () => {
    setShowImageModal(false);
    setImagePreview(null);
    setSelectedFile(null);
    setCroppedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#662b1f]" />
          <p className="mt-4 text-gray-600 font-medium">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-white  py-12 relative overflow-hidden"
    >
      {/* Background elements similar to EmployeeHome */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96  from-violet-400/20 via-purple-500/15 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96  via-cyan-500/20 to-teal-600/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="h-32 bg-gradient-to-r from-[#662b1f] to-[#8c3b2c] relative">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              ></div>
            </div>
          </div>

          {isEditing ? (
            <></>
          ) : (
            <div className="relative px-8 pb-8">
              <div className="flex flex-col items-center -mt-16 mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative inline-block"
                >
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-white ring-4 ring-white shadow-lg">
                    {croppedImage ? (
                      <img
                        src={croppedImage}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : profile.photo ? (
                      <img
                        src={`${API.defaults.baseURL}${profile.photo}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <User size={48} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={triggerFileInput}
                    className="absolute -bottom-2 -right-2 bg-[#662b1f] text-white p-2 rounded-full shadow-lg hover:bg-[#4e2118] transition"
                    title="Edit Profile Photo"
                  >
                    <Camera size={20} />
                  </motion.button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </motion.div>
                <h2 className="mt-4 text-2xl font-bold text-gray-800">
                  {profile.username}
                </h2>
                <span className="inline-block px-3 py-1 mt-2 bg-[#f8e9e7] text-[#662b1f] rounded-full text-sm font-medium capitalize">
                  {profile.department}
                </span>
              </div>

              <motion.div
                variants={itemVariants}
                className="bg-gray-50 rounded-2xl p-6 shadow-inner border border-gray-200/50"
              >
                <h3 className="text-lg font-semibold text-[#662b1f] mb-6 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-[#8c3b2c] rounded-full mr-3"></div>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField
                    icon={<User className="text-[#662b1f]" />}
                    label="Username"
                    value={profile.username}
                  />

                  <DetailField
                    icon={<Mail className="text-[#662b1f]" />}
                    label="Email"
                    value={profile.email}
                  />

                  <DetailField
                    icon={<User className="text-[#662b1f]" />}
                    label="Employee Name"
                    value={profile.employee_name}
                  />
                  <DetailField
                    icon={<Phone className="text-[#662b1f]" />}
                    label="Phone Number"
                    value={profile.phone_nmb}
                  />
                  <DetailField
                    icon={<User className="text-[#662b1f]" />}
                    label="Gender"
                    value={profile.gender}
                  />

                  <DetailField
                    icon={<Calendar className="text-[#662b1f]" />}
                    label="Join Date"
                    value={
                      profile.joint_date
                        ? new Date(profile.joint_date).toLocaleDateString()
                        : "Not set"
                    }
                  />
                  <DetailField
                    icon={<Calendar className="text-[#662b1f]" />}
                    label="Date of Birth"
                    value={new Date(profile.dob).toLocaleDateString()}
                  />
                  <DetailField
                    icon={<Briefcase className="text-[#662b1f]" />}
                    label="Department"
                    value={profile.department}
                  />
                </div>
              </motion.div>

              {/* Image Upload Modal */}
              {showImageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
                  >
                    <div className="flex justify-between items-center border-b p-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        Edit Profile Photo
                      </h3>
                      <button
                        onClick={closeModal}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="mb-4 h-64 md:h-96">
                        {imagePreview && (
                          <Cropper
                            src={imagePreview}
                            style={{ height: "100%", width: "100%" }}
                            initialAspectRatio={1}
                            aspectRatio={1}
                            guides={true}
                            ref={cropperRef}
                            viewMode={1}
                            minCropBoxHeight={100}
                            minCropBoxWidth={100}
                            responsive={true}
                            autoCropArea={0.8}
                            checkOrientation={false}
                            cropBoxMovable={true}
                            cropBoxResizable={true}
                            toggleDragModeOnDblclick={false}
                          />
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => {
                            triggerFileInput();
                            setCroppedImage(null);
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                        >
                          Change Photo
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCrop}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                          >
                            Preview Crop
                          </button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmit}
                            disabled={saving}
                            className={`px-6 py-2 bg-gradient-to-r from-[#662b1f] to-[#8c3b2c] text-white rounded-lg hover:from-[#4e2118] hover:to-[#662b1f] transition flex items-center gap-2 ${
                              saving ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            {saving ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <>
                                <Save size={16} />
                                Save Photo
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Change Password Button */}
              <motion.div
                variants={itemVariants}
                className="flex justify-end mt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleChangePasswordClick}
                  className="px-6 py-3 bg-gradient-to-r from-[#662b1f] to-[#8c3b2c] text-white rounded-xl hover:from-[#4e2118] hover:to-[#662b1f] transition shadow-lg flex items-center gap-2"
                >
                  <Key size={18} />
                  Change Password
                </motion.button>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

const DetailField = ({ icon, label, value }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="flex items-start bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group"
  >
    <div className="p-2 bg-[#f8e9e7] rounded-lg text-[#662b1f] mr-4 group-hover:rotate-6 transition-transform">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-500 mb-1">{label}</h3>
      <p className="text-gray-900 font-medium">{value || "Not set"}</p>
    </div>
  </motion.div>
);

export default ProfileEmployee;
