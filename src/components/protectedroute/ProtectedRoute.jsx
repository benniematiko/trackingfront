import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p style={{ padding: '20px' }}>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required and user doesn't have one of them
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;