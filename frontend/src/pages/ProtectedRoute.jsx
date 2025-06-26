// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    
    // Cek expired token
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return <Navigate to="/" replace />;
    }
    
    // Cek role jika diperlukan
    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return <Navigate to="/not-authorized" replace />; // Buat halaman ini jika perlu
    }
    
    return children;
  } catch (error) {
    localStorage.removeItem('token');
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;