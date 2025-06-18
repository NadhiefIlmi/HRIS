import React, { useEffect, useState } from 'react';
import { Download, File, AlertCircle, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../../api/api';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const EmployeeSalarySlip = () => {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const [salarySlips, setSalarySlips] = useState([]);

  useDocumentTitle("Salary Slip");

  useEffect(() => {
    const fetchSalarySlips = async () => {
      try {
        setLoading(true);
        const res = await API.get('/api/employee/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.salarySlips && res.data.salarySlips.length > 0) {
          const salarySlipsData = res.data.salarySlips.map(slip => ({
            id: slip._id,
            url: `${API.defaults.baseURL}${slip.path}`,
            date: new Date(slip.date).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            filename: slip.path.split('/').pop()
          }));
          
          setSalarySlips(salarySlipsData);
          setError('');
        } else {
          setError('Belum ada slip gaji tersedia.');
        }
      } catch (err) {
        console.error('Gagal mengambil data slip gaji:', err);
        setError('Gagal mengambil data slip gaji.');
      } finally {
        setLoading(false);
      }
    };

    fetchSalarySlips();
  }, [token]);

  const handleDownload = async (url, filename) => {
    try {
      setLoading(true);
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || `salary-slip_${new Date().toISOString().slice(0,10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
      setMessage('Salary slip downloaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Download failed', err);
      setError('Failed to download salary slip.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-400/20 via-purple-500/15 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/15 via-cyan-500/20 to-teal-600/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 p-4 md:p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#662b1f] to-[#8a3b2d] px-6 py-8 text-white rounded-2xl shadow-lg mb-8"
        >
          <h2 className="text-3xl font-bold">Salary Information</h2>
          <p className="mt-2 opacity-80">
            View and download your salary slips
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/30"
        >
          {(message || error) && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message
                  ? "bg-green-50 border-l-4 border-green-500"
                  : "bg-red-50 border-l-4 border-red-500"
              } flex items-center`}
            >
              {message ? (
                <Check size={20} className="text-green-500 mr-3" />
              ) : (
                <AlertCircle size={20} className="text-red-500 mr-3" />
              )}
              <p className={message ? "text-green-700" : "text-red-700"}>
                {message || error}
              </p>
            </div>
          )}

          <h3 className="text-xl font-semibold text-[#662b1f] mb-6 flex items-center">
            <div className="w-1 h-6 bg-gradient-to-b from-[#662b1f] to-[#8a3b2d] rounded-full mr-3"></div>
            <File className="mr-3 text-[#8a3b2d]" size={24} />
            Your Salary Slips
          </h3>

          {loading && salarySlips.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-[#f0e8e4] h-12 w-12"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-[#f0e8e4] rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-[#f0e8e4] rounded"></div>
                    <div className="h-4 bg-[#f0e8e4] rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : salarySlips.length > 0 ? (
            <div className="space-y-4">
              {salarySlips.map((slip) => (
                <div key={slip.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-[#662b1f]">{slip.filename}</h4>
                      <p className="text-sm text-gray-500 mt-1">Issued: {slip.date}</p>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={slip.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDownload(slip.url, slip.filename)}
                        disabled={loading}
                        className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center"
                      >
                        {loading ? (
                          <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <Download size={16} className="mr-1" />
                        )}
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-[#fdf6f3] rounded-full flex items-center justify-center mx-auto mb-4">
                <File size={24} className="text-[#8a3b2d]" />
              </div>
              <h4 className="text-lg font-medium text-[#662b1f]">
                No salary slips available
              </h4>
              <p className="text-gray-500 mt-2">
                {error || "Your salary slips haven't been generated yet."}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeeSalarySlip;