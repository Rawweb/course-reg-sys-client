const getRedirectPath = (user) => {
  if (!user) return '/login';

  switch (user.role) {
    case 'student':
      return '/student/dashboard';
    case 'lecturer':
      return '/lecturer/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/login';
  }
};

export default getRedirectPath;
