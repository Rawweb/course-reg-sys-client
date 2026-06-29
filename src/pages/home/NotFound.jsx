import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className='min-h-screen bg-bg flex items-center justify-center px-4'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-text-heading mb-2'>404</h1>
        <p className='text-text-muted mb-6'>Page not found</p>
        <Link to='/' className='text-primary font-medium hover:underline'>
          Go home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
