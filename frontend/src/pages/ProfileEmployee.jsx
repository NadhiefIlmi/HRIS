import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { Camera, Loader2, Save, User, Mail, Phone, Briefcase, Calendar, ChevronRight } from 'lucide-react';

function ProfileEmployee() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_nmb: '',
    gender: '',
    department: '',
    dob: '',
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);



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
      Object.entries(formData).forEach(([key, val]) => formDataToSend.append(key, val));
      if (selectedFile) formDataToSend.append('file', selectedFile);

      const res = await API.put('/api/employee/edit', formDataToSend, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
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
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setImagePreview(null);
                    setSelectedFile(null);
                    setFormData({
                      username: profile.username || '',
                      email: profile.email || '',
                      phone_nmb: profile.phone_nmb || '',
                      gender: profile.gender || '',
                      department: profile.department || '',
                      dob: profile.dob?.slice(0, 10) || '',
                    });
                  }}
                  className="text-[#662b1f] hover:text-[#4e2118] font-medium"
                >
                  Cancel
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 ring-4 ring-white shadow-lg">
                      {imagePreview || profile.photo ? (
                        <img
                          src={imagePreview || `http://localhost:5000${profile.photo}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <User size={64} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="absolute bottom-0 right-0 bg-[#662b1f] text-white p-2 rounded-full shadow-lg hover:bg-[#4e2118] transition transform hover:scale-110"
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
                  
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{profile.username}</h2>
                    <p className="text-gray-500 capitalize">{profile.department}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField label="Username" name="username" value={formData.username} onChange={handleChange} icon={<User size={18} className="text-gray-500" />} />
                  <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" icon={<Mail size={18} className="text-gray-500" />} />
                  <InputField label="Phone Number" name="phone_nmb" value={formData.phone_nmb} onChange={handleChange} icon={<Phone size={18} className="text-gray-500" />} />
                  <InputField label="Department" name="department" value={formData.department} onChange={handleChange} icon={<Briefcase size={18} className="text-gray-500" />} />
                  <InputField label="Date of Birth" name="dob" value={formData.dob} onChange={handleChange} type="date" icon={<Calendar size={18} className="text-gray-500" />} />

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Gender</label>
                    <div className="relative">
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="appearance-none w-full pl-12 pr-10 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#662b1f] focus:border-[#662b1f] shadow-sm"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                        <User size={18} className="text-gray-500" />
                      </div>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <ChevronRight size={18} className="text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 mt-10">
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#662b1f] to-[#8c3b2c] text-white rounded-xl hover:from-[#4e2118] hover:to-[#662b1f] transition shadow-lg flex items-center justify-center gap-2 font-medium"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="relative px-8 pb-8">
              <div className="flex flex-col items-center -mt-16 mb-8">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-white ring-4 ring-white shadow-lg">
                  {profile.photo ? (
                    <img
                      src={`http://localhost:5000${profile.photo}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <User size={48} className="text-gray-400" />
                    </div>
                  )}
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
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#662b1f] to-[#8c3b2c] text-white rounded-xl hover:from-[#4e2118] hover:to-[#662b1f] transition shadow-lg flex items-center gap-2"
                >
                  Edit Profile
                </button>
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