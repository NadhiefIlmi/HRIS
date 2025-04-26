import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [form, setForm] = useState({});
  const [eduInput, setEduInput] = useState({ degree: '', institution: '', year: '' });
  const [trainInput, setTrainInput] = useState({ title: '', provider: '', date: '' });
  const token = localStorage.getItem('token');
  // const username = localStorage.getItem('username');

  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [salarySlipUrl, setSalarySlipUrl] = useState('');
  

  useEffect(() => {
    const fetchSalarySlip = async () => {
      try {
        const response = await API.get('/api/employee/salary-slip');
        setSalarySlipUrl(response.data.salarySlip);
        setError('');
      } catch (err) {
        setError('No salary slip available or failed to fetch.');
      }
    };

    fetchSalarySlip();
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/api/employee/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployee(res.data);
      setForm(res.data); // untuk form edit
    } catch (err) {
      console.error(err);
      alert('Failed to fetch profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/');
  };

  const handleUpdate = async () => {
    try {
      const res = await API.put('/api/employee/edit', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Profile updated!');
      setEmployee(res.data); // Update username di UI secara langsung
      setForm(res.data);     // Jaga konsistensi form
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert('Update failed');
    }
  };

  const addEducation = async () => {
    try {
      await API.post('/api/employee/education/add', eduInput, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Education added!');
      setEduInput({ degree: '', institution: '', year: '' });
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding education');
    }
  };

  const deleteEducation = async (id) => {
    try {
      await API.delete(`/api/employee/education/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProfile();
    } catch (err) {
      alert('Error deleting education');
    }
  };

  const addTraining = async () => {
    try {
      await API.post('/api/employee/training/add', trainInput, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Training added!');
      setTrainInput({ title: '', provider: '', date: '' });
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding training');
    }
  };

  const deleteTraining = async (id) => {
    try {
      await API.delete(`/api/employee/training/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProfile();
    } catch (err) {
      alert('Error deleting training');
    }
  };

  const handleCheckIn = async () => {
    try {
      const res = await API.post('/api/employee/check-in', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message || 'Checked in successfully!');
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await API.post('/api/employee/check-out', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message || 'Checked out successfully!');
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to check out');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not Checked Out Yet";  // Tampilkan pesan jika checkOut null
    return new Date(dateString).toLocaleString();
  };
  
  const handleLeaveRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/api/employee/leave-request', {
        type,
        startDate,
        endDate,
        reason,
      });
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      setError(err.response.data.message);
      setMessage('');
    }
  };

  const handleDownload = async () => {
    try {
      // 1. Capture the response and request a blob
      const response = await API.get(
        '/api/employee/salary-slip/download',
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );
  
      // 2. Extract the blob from response.data
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
  
      // 3. Programmatically create an <a> and trigger download
      const a = document.createElement('a');
      const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
      const formattedTimestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      a.href = url;
      a.download = `slip-gaji_${employee.username}_${formattedTimestamp}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
  
      setError('');
    } catch (err) {
      console.error('Download error:', err);
      setError('Gagal mengunduh slip gaji.');
    }
  };
  

  return (
    <div className="min-h-screen p-4 bg-[#fefcfb] text-[#4a3b36]">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl shadow border">
          <h1 className="text-2xl font-bold mb-4">Welcome, {employee?.username}!</h1>

          {employee ? (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold">Username</label>
                <input type="text" value={form.username || ''} onChange={e => setForm({ ...form, username: e.target.value })} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block font-semibold">Email</label>
                <input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block font-semibold">Phone</label>
                <input type="text" value={form.phone_nmb || ''} onChange={e => setForm({ ...form, phone_nmb: e.target.value })} className="w-full border rounded p-2" />
              </div>
              <button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mt-2">Update Profile</button>
            </div>
          ) : (
            <p>Loading profile...</p>
          )}
        </div>

        {/* Education Section */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-bold mb-4">Education History</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Degree" value={eduInput.degree} onChange={e => setEduInput({ ...eduInput, degree: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Institution" value={eduInput.institution} onChange={e => setEduInput({ ...eduInput, institution: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Year" type="number" value={eduInput.year} onChange={e => setEduInput({ ...eduInput, year: parseInt(e.target.value) })} className="border p-2 rounded" />
          </div>
          <button onClick={addEducation} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-2">Add Education</button>
          <ul className="mt-4 space-y-1">
            {employee?.educationHistory?.map((edu) => (
              <li key={edu._id} className="flex justify-between border-b py-1">
                <span>{edu.degree}, {edu.institution} ({edu.year})</span>
                <button onClick={() => deleteEducation(edu._id)} className="text-red-500 hover:underline">Delete</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Training Section */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-bold mb-4">Training History</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Title" value={trainInput.title} onChange={e => setTrainInput({ ...trainInput, title: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Provider" value={trainInput.provider} onChange={e => setTrainInput({ ...trainInput, provider: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Date" type="date" value={trainInput.date} onChange={e => setTrainInput({ ...trainInput, date: e.target.value })} className="border p-2 rounded" />
          </div>
          <button onClick={addTraining} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-2">Add Training</button>
          <ul className="mt-4 space-y-1">
            {employee?.trainingHistory?.map((train) => (
              <li key={train._id} className="flex justify-between border-b py-1">
                <span>{train.title}, {train.provider} ({new Date(train.date).toLocaleDateString()})</span>
                <button onClick={() => deleteTraining(train._id)} className="text-red-500 hover:underline">Delete</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Attendance Section */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-bold mb-4">Attendance</h2>
          <div className="flex gap-4">
            <button
              onClick={handleCheckIn}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Check In
            </button>
            <button
              onClick={handleCheckOut}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
            >
              Check Out
            </button>
          </div>
        </div>

        {/* Attendance History Section */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-bold mb-4">Attendance History</h2>
          <ul className="space-y-2">
            {employee?.attendanceRecords?.map((attendance) => (
              <li key={attendance._id} className="flex justify-between items-center border-b py-2">
                <div>
                  <p><strong>Check-In:</strong> {new Date(attendance.checkIn).toLocaleString()}</p>
                  <p><strong>Check-Out:</strong> {attendance.checkOut ? formatDate(attendance.checkOut) : "Not Checked Out Yet"}</p>
                  <p><strong>Work Hours:</strong> {attendance.workHours}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="leave-request-form">
      <h2>Leave Request</h2>
      <form onSubmit={handleLeaveRequest}>
        <div>
          <label>Leave Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="">Select Leave Type</option>
            <option value="annual">Annual</option>
            <option value="sick">Sick</option>
            <option value="personal">Personal</option>
            <option value="maternity">Maternity</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </div>
        <div>
          <label>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </div>
        <div>
          <label>Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} required />
        </div>
        <button type="submit">Submit Request</button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <style jsx>{`
        .leave-request-form {
          max-width: 500px;
          margin: 20px auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 5px;
          background-color: #f9f9f9;
        }

        .leave-request-form h2 {
          text-align: center;
          margin-bottom: 20px;
        }

        .leave-request-form input,
        .leave-request-form select,
        .leave-request-form textarea {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .leave-request-form button {
          padding: 10px 20px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: block;
          width: 100%;
        }

        .leave-request-form button:hover {
          background-color: #218838;
        }

        .leave-request-form .success {
          color: green;
          text-align: center;
          margin-top: 10px;
        }

        .leave-request-form .error {
          color: red;
          text-align: center;
          margin-top: 10px;
        }
      `}</style>
    </div>

    <div className="salary-slip">
      <h2>Salary Slip</h2>
      <button onClick={handleDownload}>Download Your Salary Slip</button>
      {error && <p>{error}</p>}

      <style jsx>{`
        .salary-slip {
          max-width: 500px;
          margin: 20px auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        .salary-slip button {
          background-color: #007bff;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .salary-slip button:hover {
          background-color: #0056b3;
        }

        .salary-slip p {
          color: red;
        }
      `}</style>
    </div>
        <div className="text-center">
          <button onClick={handleLogout} className="bg-gray-300 hover:bg-gray-400 text-[#4a3b36] rounded-lg font-semibold px-6 py-3">Logout</button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
