import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { UserCircle, Clock, Building, Mail, Phone, Search } from 'lucide-react';

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await API.get('/api/hr/employee', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
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

  const renderEmployeePhoto = (photo, username) => {
    if (photo && photo !== '') {
      return (
        <img
          src={`http://localhost:5000/uploads/${photo}`}
          alt={username}
          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
        />
      );
    } else {
      return getInitialAvatar(username);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString || timeString === '—') return '—';

    try {
      const date = new Date(timeString);
      if (isNaN(date)) {
        console.error('Invalid date format:', timeString);
        return 'Invalid time';
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error('Error parsing date:', e);
      return 'Invalid time';
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#fefcfb] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#662b1f] tracking-tight">Employee Directory</h1>
          <p className="text-[#4a3b36] mt-2">Manage and view all employees in your organization</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-[#4a3b36]" />
            </div>
            <input
              type="text"
              placeholder="Search employees by name, department or email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#662b1f] focus:border-[#662b1f] transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Employee Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#662b1f]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => {
                const latestAttendance = emp.attendanceRecords?.[emp.attendanceRecords.length - 1];
                const inTime = formatTime(latestAttendance?.checkIn);
                const outTime = formatTime(latestAttendance?.checkOut);
                const status = outTime === '—' && inTime !== '—' ? 'active' : 'inactive';

                return (
                  <div
                    key={emp._id}
                    onClick={() => handleClick(emp._id)}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
                  >
                    {/* Status indicator */}
                    <div className="relative h-2">
                      <div className={`absolute inset-0 ${status === 'active' ? 'bg-[#662b1f]' : 'bg-gray-200'}`}></div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {renderEmployeePhoto(emp.photo, emp.username)}
                          <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${status === 'active' ? 'bg-[#662b1f]' : 'bg-gray-400'}`}></div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-[#4a3b36]">{emp.username || 'Unknown'}</h3>
                          <div className="flex items-center text-[#4a3b36] mt-1">
                            <Building size={16} className="mr-1" />
                            <span className="text-sm">{emp.department || 'No Department'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center text-[#4a3b36]">
                          <Mail size={16} className="mr-2" />
                          <span>{emp.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center text-[#4a3b36]">
                          <Phone size={16} className="mr-2" />
                          <span>{emp.phone_nmb || 'No phone'}</span>
                        </div>
                      </div>
                      
                      <div className="mt-5 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-[#4a3b36]">
                            <Clock size={16} className="mr-2 text-[#662b1f]" />
                            <span className="font-medium">Today</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex justify-between">
                          <div className="text-sm">
                            <div className="text-[#4a3b36]">In</div>
                            <div className={`font-semibold ${inTime !== '—' ? 'text-[#662b1f]' : 'text-gray-400'}`}>{inTime}</div>
                          </div>
                          <div className="text-sm">
                            <div className="text-[#4a3b36]">Out</div>
                            <div className={`font-semibold ${outTime !== '—' ? 'text-[#662b1f]' : 'text-gray-400'}`}>{outTime}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center h-64 text-[#4a3b36]">
                <UserCircle size={48} />
                <p className="mt-2">No employees found matching your search</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeesPage;