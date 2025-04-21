import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { Camera, Loader2, Save, User } from 'lucide-react';

function ProfilePage() {
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

      // Perbarui foto profil jika ada perubahan
      const updatedProfile = response.data.hr;
      if (updatedProfile.photo) {
        setProfile(prev => ({
          ...prev,
          photo: updatedProfile.photo, // Perbarui foto dengan yang baru
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#662b1f]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#662b1f] mb-2">My Profile</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-8">
              <div
                className="relative w-32 h-32 rounded-full overflow-hidden mb-4 bg-gray-200 cursor-pointer"
                onClick={triggerFileInput}
              >
                {imagePreview || profile.photo ? (
                  <img
                    src={imagePreview || `http://localhost:5000${profile.photo}`} // Gunakan path yang benar
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <User size={48} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-[#662b1f] p-2 rounded-full">
                  <Camera size={16} className="text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <span className="text-sm text-gray-500">Click to change photo</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[ 
                { label: 'Username', name: 'username', type: 'text' },
                { label: 'Full Name', name: 'fullname', type: 'text' },
                { label: 'Email', name: 'email', type: 'email' },
                { label: 'Phone Number', name: 'phone_nmb', type: 'text' }
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-gray-700 font-medium mb-2">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#662b1f]"
                  />
                </div>
              ))}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#662b1f]"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#662b1f]"
                />
              </div>
            </div>

            <div className="flex justify-between mt-8">
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
                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-[#662b1f] text-white rounded-lg hover:bg-[#4e2118] transition flex items-center gap-2"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex flex-col items-center mb-10">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-gray-200">
                {profile.photo ? (
                  <img
                    src={`http://localhost:5000${profile.photo}`} // Pastikan foto ditampilkan dengan path yang benar
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <User size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-800">{profile.fullname}</h2>
              <p className="text-gray-500">HR Manager</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[ 
                { label: 'Username', value: profile.username },
                { label: 'Full Name', value: profile.fullname },
                { label: 'Email', value: profile.email },
                { label: 'Phone Number', value: profile.phone_nmb },
                { label: 'Gender', value: profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : '' },
                { label: 'Address', value: profile.address, span: true }
              ].map((field, idx) => (
                <div
                  key={idx}
                  className={`bg-gray-50 p-4 rounded-lg ${field.span ? 'md:col-span-2' : ''}`}
                >
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{field.label}</h3>
                  <p className="text-gray-900">{field.value || 'Not set'}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-[#662b1f] text-white rounded-lg hover:bg-[#4e2118] transition"
              >
                Edit Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
