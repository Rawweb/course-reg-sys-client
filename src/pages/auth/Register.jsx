import { Link } from 'react-router-dom';

// Placeholder for now — we'll build the full registration form
// (with department dropdown, role selection, etc.) in a dedicated step
const Register = () => {
  return (
    <div className='min-h-screen bg-bg flex items-center justify-center px-4'>
      <div className='card max-w-md w-full text-center'>
        <h1 className='text-xl font-bold text-text-heading mb-2'>Register</h1>
        <p className='text-text-muted text-sm mb-4'>Coming soon</p>
        <Link to='/login' className='text-primary font-medium hover:underline text-sm'>
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default Register;
