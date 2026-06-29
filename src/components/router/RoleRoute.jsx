import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RoleRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user.role !== allowedRole) {
    return <Navigate to='/' replace />;
  }

  return children;
};

export default RoleRoute;
