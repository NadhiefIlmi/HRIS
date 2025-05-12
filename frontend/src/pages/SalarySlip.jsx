import React, { useEffect, useState } from 'react';
import API from '../api/api';

const SalarySlip = () => {
  const [salarySlipUrl, setSalarySlipUrl] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSalarySlip = async () => {
      try {
        const res = await API.get('/api/employee/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.salarySlip) {
          const fullUrl = `${API.defaults.baseURL}${res.data.salarySlip}`;
          setSalarySlipUrl(fullUrl);
        } else {
          setError('Slip gaji belum tersedia.');
        }
      } catch (err) {
        console.error(err);
        setError('Gagal mengambil data slip gaji.');
      }
    };

    fetchSalarySlip();
  }, [token]);

  const handleDownload = async () => {
    try {
      const response = await API.get('/api/employee/salary-slip/download', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      const now = new Date();
      const pad = (n) => n.toString().padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

      link.href = url;
      link.download = `slip-gaji_${timestamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      setError('Gagal mengunduh slip gaji.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-semibold mb-4">Slip Gaji Anda</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {salarySlipUrl ? (
        <>
          <div className="h-[500px] border mb-4">
            <iframe
              src={salarySlipUrl}
              title="Salary Slip Preview"
              width="100%"
              height="100%"
              className="rounded-md"
            ></iframe>
          </div>
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Unduh Slip Gaji
          </button>
        </>
      ) : (
        !error && <p>Memuat slip gaji...</p>
      )}
    </div>
  );
};

export default SalarySlip;