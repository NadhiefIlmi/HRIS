import React, { useEffect, useState } from 'react';
import { GraduationCap, Trash2, PlusCircle, School, Calendar } from 'lucide-react';
import API from '../api/api';

const EducationHistory = () => {
  const [educationHistory, setEducationHistory] = useState([]);
  const [form, setForm] = useState({ degree: '', institution: '', year: '' });
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const token = localStorage.getItem('token');

  const fetchEducation = async () => {
    try {
      const res = await API.get('/api/employee/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEducationHistory(res.data.educationHistory || []);
    } catch (err) {
      console.error('Failed to fetch education:', err);
    }
  };

  useEffect(() => {
    fetchEducation();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    const year = parseInt(form.year, 10);
    if (form.year && (year < 1900 || year > new Date().getFullYear())) {
      return setError('Year is not valid');
    }

    try {
      await API.post('/api/employee/education/add', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ degree: '', institution: '', year: '' });
      setError('');
      setIsAdding(false);
      fetchEducation();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add education');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/employee/education/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEducation();
    } catch (err) {
      alert('Failed to delete education');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 border-b border-[#f0e8e4] pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] p-3 rounded-xl">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#662b1f]">Education History</h2>
            <p className="text-sm text-gray-500">Add and manage your educational background</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 bg-[#fdf6f3] text-[#662b1f] px-4 py-2 rounded-xl border border-[#f0e8e4] hover:bg-[#f0e8e4] transition-all duration-300 font-medium"
        >
          <PlusCircle size={18} />
          <span>{isAdding ? 'Cancel' : 'Add New'}</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#fdf6f3] p-6 rounded-xl mb-8 border border-[#f0e8e4] shadow-sm">
          <h3 className="text-lg font-semibold text-[#662b1f] mb-4">Add New Education</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <School size={16} /> Degree
              </label>
              <input
                type="text"
                name="degree"
                value={form.degree}
                onChange={handleChange}
                placeholder="Bachelor of Science"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-[#8a3b2d]/30 focus:border-[#8a3b2d] outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <GraduationCap size={16} /> Institution
              </label>
              <input
                type="text"
                name="institution"
                value={form.institution}
                onChange={handleChange}
                placeholder="University Name"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-[#8a3b2d]/30 focus:border-[#8a3b2d] outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Calendar size={16} /> Graduation Year
              </label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="2023"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-[#8a3b2d]/30 focus:border-[#8a3b2d] outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleAdd}
              className="bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] text-white px-6 py-2 rounded-xl shadow hover:shadow-md hover:brightness-110 transition-all duration-300 flex items-center gap-2"
            >
              <PlusCircle size={18} />
              Add Education
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        {educationHistory.length === 0 ? (
          <div className="text-center py-12 bg-[#fdf6f3] rounded-xl border border-dashed border-[#f0e8e4]">
            <GraduationCap size={48} className="text-[#8a3b2d]/30 mx-auto mb-3" />
            <p className="text-gray-500">No education records added yet.</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="mt-3 text-[#662b1f] font-medium hover:underline"
            >
              Add your first education record
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {educationHistory.map((edu) => (
              <div
                key={edu._id}
                className="bg-[#fdf6f3] rounded-xl p-5 border border-[#f0e8e4] shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={18} className="text-[#662b1f]" />
                      <h3 className="text-lg font-semibold text-[#662b1f]">{edu.degree}</h3>
                    </div>
                    <p className="text-gray-700 mt-1">{edu.institution}</p>
                    <p className="text-gray-500 text-sm mt-1">{edu.year}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(edu._id)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-full text-red-600 hover:text-red-700 transition-all duration-300"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationHistory;