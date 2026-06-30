import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import getRedirectPath from './getRedirectPath';
import { RouteLoadingSkeleton } from '../Skeleton';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <RouteLoadingSkeleton />;

  if (user) {
    return <Navigate to={getRedirectPath(user)} replace />;
  }

  return children;
};

export default PublicRoute;
