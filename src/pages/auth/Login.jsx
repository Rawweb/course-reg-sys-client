import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import PasswordField from '../../components/ui/PasswordField';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Enter your matric number, staff ID, or email'),
  password: z.string().min(1, 'Enter your password'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: ({ identifier, password }) => login(identifier, password),
    onSuccess: (user) => {
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(`/${user.role}/dashboard`, { replace: true });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    },
  });

  const onSubmit = (formData) => mutation.mutate(formData);

  return (
    <div className='min-h-screen flex items-center justify-center bg-bg px-4'>
      <div className='card w-full max-w-md'>
        {/* Header */}
        <div className='mb-6 text-center'>
          <h1 className='text-2xl font-bold text-text-heading'>Course Registration System</h1>
          <p className='mt-1 text-sm text-text-muted'>Sign in to continue</p>
        </div>

        {/* Form. No <form> onSubmit relying on default; handleSubmit gates it. */}
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {/* Identifier */}
          <div>
            <label className='mb-1 block text-sm font-medium text-text'>
              Matric Number / Staff ID / Email
            </label>
            <input
              type='text'
              placeholder='e.g. 2024513005 or CS200'
              className='w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm
                         text-text placeholder:text-text-placeholder focus:border-primary
                         focus:outline-none focus:ring-1 focus:ring-primary transition-colors'
              {...register('identifier')}
            />
            {errors.identifier && (
              <p className='mt-1 text-xs text-danger'>{errors.identifier.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className='mb-1 block text-sm font-medium text-text'>Password</label>
            <PasswordField {...register('password')} />
            {errors.password && (
              <p className='mt-1 text-xs text-danger'>{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type='submit'
            className='btn'
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
