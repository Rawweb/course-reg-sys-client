import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  return (
    <div>
      <h1 className='text-2xl font-bold text-text-heading'>Welcome, {user?.name?.split(' ')[0]}</h1>
      <p className='mt-1 text-sm text-text-muted'>
        {user?.department} · {user?.level} Level
      </p>
      <div className='card mt-6'>
        <p className='text-text'>Your dashboard content is coming next.</p>
      </div>
    </div>
  );
};

export default StudentDashboard;
