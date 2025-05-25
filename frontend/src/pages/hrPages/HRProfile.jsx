import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/api';
import { Camera, Loader2, Save, User, Edit, Lock, ChevronRight, Mail, Phone, MapPin, AtSign } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';

function HRProfile() {
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
    fullname: '',
    email: '',
    phone_nmb: '',
    gender: '',
    address: '',
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useDocumentTitle("My Profile");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/hr/me');
      setProfile(response.data);
      setFormData({
        username: response.data.username || '',
        fullname: response.data.fullname || '',
        email: response.data.email || '',
        phone_nmb: response.data.phone_nmb || '',
        gender: response.data.gender || '',
        address: response.data.address || '',
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
      setLoading(false);
      if (err.response && err.response.status === 401) {
        localStorage.clear();
        navigate('/');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
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
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      }

      const response = await API.put('/api/hr/edit', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const updatedProfile = response.data.hr;
      if (updatedProfile.photo) {
        setProfile(prev => ({
          ...prev,
          photo: updatedProfile.photo,
        }));
      }

      setSaving(false);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#662b1f] mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header with curved design */}
        <div className="bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] h-48 relative">
          <div className="absolute bottom-0 w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
              <path fill="#ffffff" fillOpacity="1" d="M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,176C672,171,768,181,864,176C960,171,1056,149,1152,149.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        </div>
        
        <div className="px-8 pb-8 pt-4 relative z-10">
          {/* Profile Image Section */}
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between -mt-24 mb-8">
            <div className="flex flex-col items-center md:items-start md:flex-row md:space-x-6">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                {isEditing ? (
                  imagePreview || profile.photo ? (
                    <img
                      src={imagePreview || `${API.defaults.baseURL}${profile.photo}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <User size={56} className="text-gray-400" />
                    </div>
                  )
                ) : (
                  profile.photo ? (
                    <img
                      src={`${API.defaults.baseURL}${profile.photo}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <User size={56} className="text-gray-400" />
                    </div>
                  )
                )}
              </div>
              
              <div className="mt-4 md:mt-12 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800">{profile.fullname}</h2>
                <div className="flex items-center justify-center md:justify-start mt-1">
                  <span className="px-3 py-1 bg-[#662b1f] bg-opacity-10 text-[#662b1f] rounded-full text-sm font-medium">HR Manager</span>
                </div>
              </div>
            </div>
            
            {!isEditing && (
              <div className="mt-6 md:mt-12 flex flex-col space-y-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#662b1f] text-white rounded-xl hover:bg-[#4e2118] transition shadow-md"
                >
                  <Edit size={18} />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => navigate('/password')}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#662b1f] text-[#662b1f] rounded-xl hover:bg-[#662b1f] hover:text-white transition"
                >
                  <Lock size={18} />
                  <span>Change Password</span>
                </button>
              </div>
            )}
            
            {isEditing && (
              <div className="mt-6 md:mt-12">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#662b1f] text-white rounded-xl hover:bg-[#4e2118] transition shadow-md"
                >
                  <Camera size={18} />
                  <span>Change Photo</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <p className="text-sm text-gray-500 mt-2 text-center">JPG, PNG allowed</p>
              </div>
            )}
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border-l-4 border-red-500 flex items-start">
              <div className="flex-1">{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 border-l-4 border-green-500 flex items-start">
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          {/* Main Content */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 shadow-inner">
                <h3 className="text-lg font-semibold text-[#662b1f] mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[ 
                    { label: 'Username', name: 'username', type: 'text', icon: <AtSign size={16} className="text-gray-500" /> },
                    { label: 'Full Name', name: 'fullname', type: 'text', icon: <User size={16} className="text-gray-500" /> },
                    { label: 'Email', name: 'email', type: 'email', icon: <Mail size={16} className="text-gray-500" /> },
                    { label: 'Phone Number', name: 'phone_nmb', type: 'text', icon: <Phone size={16} className="text-gray-500" /> }
                  ].map((field) => (
                    <div key={field.name} className="relative">
                      <label className="block text-gray-700 font-medium mb-2">{field.label}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {field.icon}
                        </div>
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#662b1f] focus:border-transparent bg-white"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="relative">
                    <label className="block text-gray-700 font-medium mb-2">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#662b1f] focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none top-8">
                      <ChevronRight size={16} className="text-gray-500 transform rotate-90" />
                    </div>
                  </div>

                  <div className="md:col-span-2 relative">
                    <label className="block text-gray-700 font-medium mb-2">Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin size={16} className="text-gray-500" />
                      </div>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#662b1f] focus:border-transparent bg-white"
                        placeholder="Enter your address"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setImagePreview(null);
                    setSelectedFile(null);
                    setFormData({
                      username: profile.username || '',
                      fullname: profile.fullname || '',
                      email: profile.email || '',
                      phone_nmb: profile.phone_nmb || '',
                      gender: profile.gender || '',
                      address: profile.address || '',
                    });
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#662b1f] text-white rounded-xl hover:bg-[#4e2118] transition flex items-center gap-2 font-medium shadow-md"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-6 shadow-inner">
              <h3 className="text-lg font-semibold text-[#662b1f] mb-6">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[ 
                  { label: 'Username', value: profile.username, icon: <AtSign size={20} className="text-[#662b1f]" /> },
                  { label: 'Full Name', value: profile.fullname, icon: <User size={20} className="text-[#662b1f]" /> },
                  { label: 'Email', value: profile.email, icon: <Mail size={20} className="text-[#662b1f]" /> },
                  { label: 'Phone Number', value: profile.phone_nmb, icon: <Phone size={20} className="text-[#662b1f]" /> },
                  { label: 'Gender', value: profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : '', icon: <User size={20} className="text-[#662b1f]" /> },
                  { label: 'Address', value: profile.address, icon: <MapPin size={20} className="text-[#662b1f]" /> }
                ].map((field, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition duration-300">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#662b1f] bg-opacity-10 rounded-lg">
                        {field.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">{field.label}</h3>
                        <p className="text-gray-900 font-medium">{field.value || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HRProfile;