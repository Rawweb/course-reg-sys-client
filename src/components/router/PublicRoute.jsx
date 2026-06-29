import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import getRedirectPath from './getRedirectPath';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to={getRedirectPath(user)} replace />;
  }

  return children;
};

export default PublicRoute;
