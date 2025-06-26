// components/NotAuthorized.jsx
import { Link, useNavigate } from 'react-router-dom';
import useDocumentTitle from "../hooks/useDocumentTitle";

const NotAuthorized = () => {
  const navigate = useNavigate();
  useDocumentTitle("Unauthorized Access");
  const handleHomeClick = () => {
    // Hapus token dari localStorage
    localStorage.removeItem('token');
    // Hapus juga sessionToken jika ada
    localStorage.removeItem('sessionToken');
    // Redirect ke beranda
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center p-4">
      {/* Background decorative elements (sama seperti di App.jsx) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#662b1f]/5 to-orange-200/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 max-w-md w-full z-10">
        <div className="flex flex-col items-center">
          {/* Icon dengan gaya yang konsisten */}
          <div className="w-20 h-20 bg-gradient-to-r from-[#662b1f] to-[#8a3b2a] rounded-full flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Judul dengan gradient text seperti di App.jsx */}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#662b1f] to-[#8a3b2a] bg-clip-text text-transparent mb-2">
            Akses Ditolak
          </h2>
          
          <p className="text-gray-600 mb-6 text-center">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>

          {/* Button group dengan spacing yang baik */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-[#662b1f] to-[#8a3b2a] text-white rounded-xl hover:from-[#7d3420] hover:to-[#9b4225] transition-all font-medium shadow-md"
            >
              Kembali
            </button>
            
            <button
              onClick={handleHomeClick}
              className="flex-1 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium shadow-sm"
            >
              Ke Beranda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotAuthorized;