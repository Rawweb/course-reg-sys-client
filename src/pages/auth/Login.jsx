import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import getRedirectPath from '../../components/router/getRedirectPath';

// Zod schema — defines what a valid login form looks like
// react-hook-form uses this to validate input before submission
const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (formData) => {
    try {
      const { data } = await api.post('/auth/login', formData);

      // Our backend returns { success, message, data: { ...user, token } }
      saveAuth(data.data, data.data.token);
      toast.success('Welcome back!');
      navigate(getRedirectPath(data.data));
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
    }
  };

  return (
    <div className='min-h-screen bg-bg flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-14 h-14 bg-primary rounded-xl mb-4'>
            <span className='text-white text-xl font-bold cursor-pointer'>CR</span>
          </div>
          <h1 className='text-2xl font-bold text-text-heading'>Welcome back</h1>
          <p className='text-text-muted text-sm mt-1'>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className='card'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            {/* Email */}
            <div>
              <label className='block text-sm font-medium text-text mb-1.5'>Email address</label>
              <input
                type='email'
                placeholder='you@unizik.edu.ng'
                {...register('email')}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text placeholder:text-text-placeholder
                  outline-none transition-all duration-200
                  focus:ring-2 focus:ring-primary focus:border-transparent
                  ${errors.email ? 'border-danger bg-red-50' : 'border-border bg-surface'}`}
              />
              {errors.email && <p className='text-danger text-xs mt-1.5'>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className='block text-sm font-medium text-text mb-1.5'>Password</label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Your password'
                  {...register('password')}
                  className={`w-full px-4 py-2.5 pr-11 rounded-lg border text-sm text-text placeholder:text-text-placeholder
                    outline-none transition-all duration-200
                    focus:ring-2 focus:ring-primary focus:border-transparent
                    ${errors.password ? 'border-danger bg-red-50' : 'border-border bg-surface'}`}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text'
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p className='text-danger text-xs mt-1.5'>{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button type='submit' disabled={isSubmitting} className='btn mt-2'>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className='text-center text-sm text-text-muted mt-6'>
          Don't have an account?{' '}
          <Link to='/register' className='text-primary font-medium hover:underline'>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
