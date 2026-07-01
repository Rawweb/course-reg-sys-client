import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FullPageSkeleton } from '../ui/Skeleton';

const RoleRoute = ({ allowedRole, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageSkeleton />;
  }
  
  if (!user) {
    return <Navigate to='/login' replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

export default RoleRoute;
