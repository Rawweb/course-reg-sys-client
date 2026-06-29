import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className='min-h-screen bg-bg flex items-center justify-center px-4'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold text-text-heading mb-3'>Course Registration System</h1>
        <p className='text-text-muted mb-6'>Computer Science · Mathematics · Physics</p>
        <Link to='/login' className='text-primary font-medium hover:underline'>
          Sign in to continue
        </Link>
      </div>
    </div>
  );
};

export default Landing;
