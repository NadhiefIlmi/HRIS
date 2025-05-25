import React, { useState } from 'react';
import API from '../../api/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, Calendar, Briefcase, Lock, Users } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    username: '',
    nik: '',
    dob: '',
    department: '',
    password: '',
    gender: 'male',
  });

  useDocumentTitle("Add New Employee");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, nik, dob, department, password } = formData;
    if (!username || !nik || !dob || !department || !password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      const response = await API.post('/api/employee/register', formData);
      toast.success(response.data.message);
      navigate('/employees');
    } catch (error) {
      if (error.response) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Network error or server not responding');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left Side - Decorative Panel */}
        <div className="bg-gradient-to-br from-[#662b1f] to-[#8a3b2d] md:w-1/3 p-8 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-6">Add New Employee</h2>
            <p className="text-[#f5e8e0] mb-6">
              Complete the form to register a new employee to the Chateraise system. All fields marked with * are required.
            </p>
          </div>
          <div className="mt-auto">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Secure employee registration
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Easy department management
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Username <span className="text-[#662b1f]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#662b1f] focus:border-transparent outline-none transition"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  NIK <span className="text-[#662b1f]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#662b1f] focus:border-transparent outline-none transition"
                    placeholder="Enter National ID"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Date of Birth <span className="text-[#662b1f]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#662b1f] focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Gender <span className="text-[#662b1f]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users size={18} className="text-gray-400" />
                    </div>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#662b1f] focus:border-transparent outline-none transition appearance-none bg-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Department <span className="text-[#662b1f]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#662b1f] focus:border-transparent outline-none transition"
                    placeholder="Enter department"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Password <span className="text-[#662b1f]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#662b1f] focus:border-transparent outline-none transition"
                    placeholder="Create password"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate('/employees')}
                className="text-[#662b1f] hover:text-[#8a3b2d] font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] hover:from-[#8a3b2d] hover:to-[#662b1f] text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 flex items-center"
              >
                <span>Add Employee</span>
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AddEmployee;