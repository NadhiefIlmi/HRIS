import React, { useState, useEffect } from 'react';
import { Award, Trash2, PlusCircle, BookOpen, Calendar, Building2 } from 'lucide-react';
import API from '../../api/api';
import useDocumentTitle from '../../hooks/useDocumentTitle';

function TrainingHistory() {
  const [employee, setEmployee] = useState(null);
  const [trainInput, setTrainInput] = useState({ title: '', provider: '', date: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const token = localStorage.getItem('token');

  useDocumentTitle("Training History");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/api/employee/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployee(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch employee data');
      setLoading(false);
    }
  };

  const addTraining = async () => {
    if (!trainInput.title || !trainInput.provider || !trainInput.date) {
      setError('Please fill all fields');
      return;
    }
    
    try {
      await API.post('/api/employee/training/add', trainInput, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrainInput({ title: '', provider: '', date: '' });
      setError('');
      setIsAdding(false);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding training');
    }
  };

  const deleteTraining = async (id) => {
    try {
      await API.delete(`/api/employee/training/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProfile();
    } catch (err) {
      setError('Failed to delete training');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#8a3b2d]/20 mb-4"></div>
          <div className="h-4 w-32 bg-[#8a3b2d]/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 border-b border-[#f0e8e4] pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] p-3 rounded-xl">
            <Award size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#662b1f]">Training History</h2>
            <p className="text-sm text-gray-500">Add and manage your professional development</p>
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

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-center">
          <span className="flex-grow">{error}</span>
          <button onClick={() => setError('')} className="text-red-800 font-bold">×</button>
        </div>
      )}

      {isAdding && (
        <div className="bg-[#fdf6f3] p-6 rounded-xl mb-8 border border-[#f0e8e4] shadow-sm">
          <h3 className="text-lg font-semibold text-[#662b1f] mb-4">Add New Training</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <BookOpen size={16} /> Training Title
              </label>
              <input
                type="text"
                name="title"
                value={trainInput.title}
                onChange={(e) => setTrainInput({ ...trainInput, title: e.target.value })}
                placeholder="Leadership Development"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-[#8a3b2d]/30 focus:border-[#8a3b2d] outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Building2 size={16} /> Provider
              </label>
              <input
                type="text"
                name="provider"
                value={trainInput.provider}
                onChange={(e) => setTrainInput({ ...trainInput, provider: e.target.value })}
                placeholder="Training Provider"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-[#8a3b2d]/30 focus:border-[#8a3b2d] outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Calendar size={16} /> Completion Date
              </label>
              <input
                type="date"
                name="date"
                value={trainInput.date}
                onChange={(e) => setTrainInput({ ...trainInput, date: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-[#8a3b2d]/30 focus:border-[#8a3b2d] outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={addTraining}
              className="bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] text-white px-6 py-2 rounded-xl shadow hover:shadow-md hover:brightness-110 transition-all duration-300 flex items-center gap-2"
            >
              <PlusCircle size={18} />
              Add Training
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        {!employee?.trainingHistory || employee.trainingHistory.length === 0 ? (
          <div className="text-center py-12 bg-[#fdf6f3] rounded-xl border border-dashed border-[#f0e8e4]">
            <Award size={48} className="text-[#8a3b2d]/30 mx-auto mb-3" />
            <p className="text-gray-500">No training records available.</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="mt-3 text-[#662b1f] font-medium hover:underline"
            >
              Add your first training record
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-500 px-4 mb-2">
              <span className="w-1/2">Training Details</span>
              <span className="w-1/4 text-center">Provider</span>
              <span className="w-1/4 text-center">Date</span>
              <span className="w-10"></span>
            </div>
            
            {employee.trainingHistory.map((training) => (
              <div
                key={training._id}
                className="bg-[#fdf6f3] border border-[#f0e8e4] p-4 rounded-xl shadow-sm hover:shadow transition-all duration-300 group flex items-center"
              >
                <div className="flex items-center space-x-3 w-1/2">
                  <div className="bg-[#662b1f]/10 p-2 rounded-lg">
                    <Award size={18} className="text-[#662b1f]" />
                  </div>
                  <span className="font-medium text-[#662b1f]">{training.title}</span>
                </div>
                
                <div className="w-1/4 text-center text-gray-700">{training.provider}</div>
                
                <div className="w-1/4 text-center text-gray-500 text-sm">
                  {new Date(training.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                
                <div className="w-10 flex justify-end">
                  <button
                    onClick={() => deleteTraining(training._id)}
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
}

export default TrainingHistory;