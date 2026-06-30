import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RouteLoadingSkeleton } from '../Skeleton';

const RoleRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <RouteLoadingSkeleton />;

  if (user.role !== allowedRole) {
    return <Navigate to='/' replace />;
  }

  return children;
};

export default RoleRoute;
