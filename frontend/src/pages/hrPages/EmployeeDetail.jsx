import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/api';
import { FaBuilding, FaIdCard, FaEnvelope, FaPhone, FaCalendarAlt, FaUser, FaTrash, FaUpload } from 'react-icons/fa';
import useDocumentTitle from '../../hooks/useDocumentTitle';

function EmployeeDetail() {
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const navigate = useNavigate();

    useDocumentTitle("Employee Detail");

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === 'application/pdf') {
            setFile(selected);
            setUploadMessage('');
        } else {
            setUploadMessage('Only PDF files are allowed.');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            setFile(droppedFile);
            setUploadMessage('');
        } else {
            setUploadMessage('Only PDF files are allowed.');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('salarySlip', file);

        setIsUploading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await API.post(`/api/hr/upload-salary-slip/${id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setUploadMessage(response.data.message);
            setFile(null);
        } catch (error) {
            console.error('Error uploading salary slip:', error);
            setUploadMessage('Failed to upload salary slip');
        } finally {
            setIsUploading(false);
            setTimeout(() => setUploadMessage(''), 5000);
        }
    };

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await API.get('/api/hr/employee', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const found = response.data.find((emp) => emp._id === id);
                if (found) {
                    setEmployee(found);
                }
            } catch (error) {
                console.error('Error fetching employee:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [id]);

     useEffect(() => {
        const fetchExistingFile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await API.get(`/api/hr/salary-slip/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (res.data.salarySlip) {
                    setFile({
                        name: res.data.salarySlip.split('/').pop(),
                        url: res.data.salarySlip
                    });
                }
                console.log(file);
            } catch (err) {
                console.error('Failed to fetch salary slip:', err);
            }
        };

        fetchExistingFile();
    }, [id]);

    const handleDelete = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this employee?');
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('token');
            await API.delete(`/api/hr/deleteEmployee/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Employee deleted successfully');
            navigate('/employees');
        } catch (error) {
            console.error('Error deleting employee:', error);
            alert('Failed to delete employee');
        }
    };

    // Updated formatDate function with different handling for DOB vs other dates
    const formatDate = (dateString, includeTimes = true) => {
        if (!dateString) return '—';
        const date = new Date(dateString);

        // Format for date only (for DOB)
        if (!includeTimes) {
            const dateOptions = {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            };
            return date.toLocaleDateString('en-GB', dateOptions);
        }

        // Format for date with time (for attendance records, etc.)
        const dateOptions = {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        };

        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        };

        const formattedDate = date.toLocaleDateString('en-GB', dateOptions);
        const formattedTime = date.toLocaleTimeString('en-GB', timeOptions);

        return `${formattedDate} at ${formattedTime}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#662b1f]"></div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h2 className="text-2xl font-bold text-gray-700">Employee Not Found</h2>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-5 py-2 bg-[#662b1f] text-white rounded-md hover:bg-[#8a3b2a] transition"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // Format DOB without time
    const dob = formatDate(employee.dob, false);

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-xl my-8">

            {/* Header */}
            <div className="bg-gradient-to-r from-[#662b1f] to-[#8a3b2a] text-white p-6 rounded-t-xl mb-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold">{employee.username}</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-white text-[#662b1f] rounded-md hover:bg-gray-100 transition font-medium"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium flex items-center gap-2"
                        >
                            <FaTrash /> Delete
                        </button>
                    </div>
                </div>
                <p className="text-gray-200 mt-2">{employee.department}</p>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Profile Picture Column */}
                <div className="flex flex-col items-center">
                    {employee.photo ? (
                        <img
                            src={`${API.defaults.baseURL}${employee.photo}`}
                            alt={employee.username}
                            className="w-36 h-36 rounded-full object-cover border-4 border-[#662b1f] shadow-lg"
                        />
                    ) : (
                        <div className="bg-gradient-to-br from-[#662b1f] to-[#8a3b2a] text-white w-36 h-36 rounded-full flex items-center justify-center text-4xl font-bold uppercase shadow-lg">
                            {employee.username?.charAt(0)}
                        </div>
                    )}
                </div>

                {/* Employee Details Column 1 */}
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
                        <FaEnvelope className="text-[#662b1f] mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{employee.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
                        <FaPhone className="text-[#662b1f] mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{employee.phone_nmb}</p>
                        </div>
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
                        <FaIdCard className="text-[#662b1f] mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">NIK</p>
                            <p className="font-medium">{employee.nik}</p>
                        </div>
                    </div>
                </div>

                {/* Employee Details Column 2 */}
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
                        <FaBuilding className="text-[#662b1f] mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Department</p>
                            <p className="font-medium">{employee.department}</p>
                        </div>
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
                        <FaCalendarAlt className="text-[#662b1f] mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="font-medium">{dob}</p>
                        </div>
                    </div>

                    {/* Gender Column */}
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
                        <FaUser className="text-[#662b1f] mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="font-medium">{employee.gender || '—'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leave Information */}
            {employee.leaveInfo && (
                <div className="mb-8">
                    <h4 className="text-xl font-semibold text-[#662b1f] mb-4 border-b pb-2">Leave Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg shadow-md border-l-4 border-green-500">
                            <p className="text-sm text-gray-600">Total Annual Leave</p>
                            <p className="text-2xl font-bold text-green-700">{employee.leaveInfo.totalAnnualLeave || 0} days</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg shadow-md border-l-4 border-red-500">
                            <p className="text-sm text-gray-600">Used Leave</p>
                            <p className="text-2xl font-bold text-red-700">{employee.leaveInfo.usedAnnualLeave || 0} days</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                            <p className="text-sm text-gray-600">Remaining Leave</p>
                            <p className="text-2xl font-bold text-blue-700">{employee.leaveInfo.remainingAnnualLeave || 0} days</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Attendance Records */}
            <div className="mb-8">
                <h4 className="text-xl font-semibold text-[#662b1f] mb-4 border-b pb-2">Attendance Records</h4>
                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(employee.attendanceRecords || []).slice().reverse().slice(0, 5).map((record, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                        {formatDate(record.checkIn) || '—'}
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                        {formatDate(record.checkOut) || '—'}
                                    </td>
                                </tr>
                            ))}
                            {(!employee.attendanceRecords || employee.attendanceRecords.length === 0) && (
                                <tr>
                                    <td colSpan="2" className="py-4 px-6 text-sm text-center text-gray-500">No attendance records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Education History */}
            {employee.educationHistory && employee.educationHistory.length > 0 && (
                <div className="mb-8">
                    <h4 className="text-xl font-semibold text-[#662b1f] mb-4 border-b pb-2">Education History</h4>
                    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Degree</th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employee.educationHistory.map((edu, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="py-4 px-6 text-sm font-medium text-gray-900">{edu.degree || '—'}</td>
                                        <td className="py-4 px-6 text-sm text-gray-900">{edu.institution || '—'}</td>
                                        <td className="py-4 px-6 text-sm text-gray-900">{edu.year || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Training History */}
            {employee.trainingHistory && employee.trainingHistory.length > 0 && (
                <div className="mb-8">
                    <h4 className="text-xl font-semibold text-[#662b1f] mb-4 border-b pb-2">Training History</h4>
                    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employee.trainingHistory.map((training, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="py-4 px-6 text-sm font-medium text-gray-900">{training.title || '—'}</td>
                                        <td className="py-4 px-6 text-sm text-gray-900">{training.provider || '—'}</td>
                                        <td className="py-4 px-6 text-sm text-gray-900">{formatDate(training.date, false)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* Upload Salary Slip */}
            <div className="mb-6 bg-gray-50 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-[#662b1f] mb-4">Upload Salary Slip</h3>
            <div className="flex flex-col items-center w-full">
                {!file ? (
                    <label
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragOver(true);
                        }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 ${
                            isDragOver ? 'border-[#662b1f] bg-gray-100' : 'border-gray-300'
                        } border-dashed rounded-lg cursor-pointer transition`}
                    >
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf"
                            className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center text-gray-500">
                            <FaUpload className="text-4xl mb-2" />
                            <span className="text-sm">Drag & drop your PDF here</span>
                            <span className="text-sm">or click to select a file</span>
                        </div>
                    </label>
                ) : (
                    <div className="flex flex-col items-center justify-center w-full border border-gray-300 rounded-lg bg-white p-4 text-center">
                        <p className="text-sm text-gray-700 mb-2">
                            Selected file: <span className="font-medium">{file.name}</span>
                        </p>
                        <div className="flex gap-4">
                            <label className="text-sm text-blue-600 cursor-pointer hover:underline">
                                Change file
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf"
                                    className="hidden"
                                />
                            </label>
                            <button
                                type="button"
                                onClick={() => setFile(null)}
                                className="text-sm text-red-600 hover:underline"
                            >
                                Remove file
                            </button>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={isUploading || !file}
                    className="mt-4 w-full px-4 py-2 bg-[#662b1f] text-white rounded hover:bg-[#8a3b2a] disabled:opacity-50 flex items-center justify-center gap-2 transition"
                >
                    {isUploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                    ) : (
                        <FaUpload />
                    )}
                    Upload
                </button>
            </div>

            {uploadMessage && (
                <p
                    className={`mt-3 text-sm font-medium ${
                        uploadMessage.includes('Failed') ? 'text-red-500' : 'text-green-500'
                    }`}
                >
                    {uploadMessage}
                </p>
            )}
        </div>
        </div>
    );
}

export default EmployeeDetail;