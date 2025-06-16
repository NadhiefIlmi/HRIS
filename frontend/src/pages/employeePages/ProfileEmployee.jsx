import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/api';
import { Camera, Loader2, Save, User, Mail, Phone, Briefcase, Calendar, ChevronRight } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';

function ProfileEmployee() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  // Pagination state for Education and Training
  const [educationPage, setEducationPage] = useState(1);
  const [trainingPage, setTrainingPage] = useState(1);
  const pageSize = 3;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_nmb: '',
    gender: '',
    department: '',
    dob: '',
    educationHistory: [],
    trainingHistory: [],
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useDocumentTitle("My Profile");

   // Fungsi untuk menavigasi ke halaman Change Password
   const handleChangePasswordClick = () => {
    navigate("/change-password"); // pastikan route ini sudah terdaftar di router kamu
  };
  
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/employee/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfile(res.data);
      setFormData({
        username: res.data.username || '',
        email: res.data.email || '',
        phone_nmb: res.data.phone_nmb || '',
        gender: res.data.gender || '',
        department: res.data.department || '',
        dob: res.data.dob?.slice(0, 10) || '',
        educationHistory: res.data.educationHistory || [],
        trainingHistory: res.data.trainingHistory || [],
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load profile');
      setLoading(false);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handlers for Education History
  const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    const newEducation = [...formData.educationHistory];
    newEducation[index][name] = value;
    setFormData({ ...formData, educationHistory: newEducation });
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      educationHistory: [
        ...prev.educationHistory,
        { last_education: '', institution: '', majority: '', year_of_graduation: '' },
      ],
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      educationHistory: prev.educationHistory.filter((_, i) => i !== index),
    }));
  };

  // Handlers for Training History
  const handleTrainingChange = (index, e) => {
    const { name, value } = e.target;
    const newTraining = [...formData.trainingHistory];
    newTraining[index][name] = value;
    setFormData({ ...formData, trainingHistory: newTraining });
  };

  const addTraining = () => {
    setFormData(prev => ({
      ...prev,
      trainingHistory: [
        ...prev.trainingHistory,
        { title: '', provider: '', start_date: '', end_date: '' },
      ],
    }));
  };

  const removeTraining = (index) => {
    setFormData(prev => ({
      ...prev,
      trainingHistory: prev.trainingHistory.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formDataToSend = new FormData();

      // Prepare formData with JSON string for arrays
      Object.entries({
        ...formData,
        educationHistory: formData.educationHistory,
        trainingHistory: formData.trainingHistory,
      }).forEach(([key, val]) => {
        if (key === 'educationHistory' || key === 'trainingHistory') {
          formDataToSend.append(key, JSON.stringify(val));
        } else {
          formDataToSend.append(key, val);
        }
      });

      if (selectedFile) formDataToSend.append('file', selectedFile);

      const res = await API.put('/api/employee/edit', formDataToSend, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile(res.data.employee);
      setIsEditing(false);
      setSelectedFile(null);
      setImagePreview(null);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#662b1f]" />
          <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="h-32 bg-gradient-to-r from-[#662b1f] to-[#8c3b2c]"></div>
          
          {error && (
            <div className="mx-8 -mt-4 bg-red-50 border-l-4 border-red-600 text-red-700 p-4 rounded-lg shadow-md">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="mx-8 -mt-4 bg-green-50 border-l-4 border-green-600 text-green-700 p-4 rounded-lg shadow-md">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMessage}
              </div>
            </div>
          )}

          {isEditing ? (
            <></>
          ) : (
            <div className="relative px-8 pb-8">
              <div className="flex flex-col items-center -mt-16 mb-8">
              <div className="relative inline-block">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-white ring-4 ring-white shadow-lg">
                  {profile.photo ? (
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
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="absolute -bottom-2 -right-2 bg-[#662b1f] text-white p-2 rounded-full shadow-lg hover:bg-[#4e2118] transition transform hover:scale-110"
                  title="Edit Profile Photo"
                >
                  <Camera size={20} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-800">{profile.username}</h2>
              <span className="inline-block px-3 py-1 mt-2 bg-[#f8e9e7] text-[#662b1f] rounded-full text-sm font-medium capitalize">
                {profile.department}
              </span>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6 shadow-inner">
                <h3 className="text-lg font-semibold text-[#662b1f] mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField icon={<Mail />} label="Email" value={profile.email} />
                  <DetailField icon={<Phone />} label="Phone Number" value={profile.phone_nmb} />
                  <DetailField icon={<User />} label="Gender" value={profile.gender} />
                  <DetailField icon={<Calendar />} label="Date of Birth" value={new Date(profile.dob).toLocaleDateString()} />
                  <DetailField icon={<Briefcase />} label="Department" value={profile.department} />
                </div>
              </div>

              <div className="flex justify-end mt-8">
              </div>
              {/* Button untuk mengarahkan ke Change Password */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleChangePasswordClick} // navigasi ke halaman Change Password
                  className="px-6 py-3 bg-gradient-to-r from-[#662b1f] to-[#8c3b2c] text-white rounded-xl hover:from-[#4e2118] hover:to-[#662b1f] transition shadow-lg flex items-center gap-2"
                >
                  Change Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const InputField = ({ label, name, value, onChange, type = 'text', icon }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-2">{label}</label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#662b1f] focus:border-[#662b1f] shadow-sm"
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-4">
        {icon}
      </div>
    </div>
  </div>
);

const DetailField = ({ icon, label, value }) => (
  <div className="flex items-start bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
    <div className="p-2 bg-[#f8e9e7] rounded-lg text-[#662b1f] mr-4">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-500 mb-1">{label}</h3>
      <p className="text-gray-900 font-medium">{value || 'Not set'}</p>
    </div>
  </div>
);

export default ProfileEmployee;