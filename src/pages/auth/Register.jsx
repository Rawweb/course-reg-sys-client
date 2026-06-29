import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerUser } from '../../api/authApi';
import { getDepartments } from '../../api/departmentApi';
import { useAuth } from '../../context/AuthContext';
import getRedirectPath from '../../components/router/getRedirectPath';

const LEVELS = [100, 200, 300, 400, 500];

const schema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['student', 'lecturer']),
    departmentId: z.string().min(1, 'Department is required'),
    matricNumber: z.string().optional(),
    level: z.string().optional(),
  })
  // .refine() runs AFTER the basic field checks above pass,
  // and gets access to the whole form's values at once —
  // this is how we enforce "matricNumber is required, but only for students"
  .refine(
    (data) => {
      if (data.role === 'student') {
        return Boolean(data.matricNumber && data.matricNumber.length > 0);
      }
      return true;
    },
    { message: 'Matric number is required for students', path: ['matricNumber'] },
  )
  .refine(
    (data) => {
      if (data.role === 'student') {
        return Boolean(data.level);
      }
      return true;
    },
    { message: 'Level is required for students', path: ['level'] },
  );

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' },
  });

  // watch() lets us reactively read the current value of a field
  // as the user types/selects — here we use it to know which
  // role is currently chosen, so we can show/hide the right fields
  const selectedRole = watch('role');

  const onSubmit = async (formData) => {
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        departmentId: formData.departmentId,
        ...(formData.role === 'student' && {
          matricNumber: formData.matricNumber,
          level: Number(formData.level),
        }),
      };

      const response = await registerUser(payload);

      if (formData.role === 'lecturer') {
        toast.success(response.message);
        navigate('/login');
        return;
      }

      // response.data is the user object directly — registerUser() already unwrapped axios's envelope
      saveAuth(response.data, response.data.token);
      toast.success('Registration successful');
      navigate(getRedirectPath(response.data));
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    }
  };

  return (
    <div className='min-h-screen bg-bg flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-14 h-14 bg-primary rounded-xl mb-4'>
            <span className='text-white text-xl font-bold'>CR</span>
          </div>
          <h1 className='text-2xl font-bold text-text-heading'>Create your account</h1>
          <p className='text-text-muted text-sm mt-1'>Join the Course Registration System</p>
        </div>

        <div className='card'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            {/* Role selector */}
            <div>
              <label className='block text-sm font-medium text-text mb-1.5'>I am a</label>
              <select
                {...register('role')}
                className='w-full px-4 py-2.5 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
              >
                <option value='student'>Student</option>
                <option value='lecturer'>Lecturer</option>
              </select>
            </div>

            {/* Full name */}
            <div>
              <label className='block text-sm font-medium text-text mb-1.5'>Full Name</label>
              <input
                {...register('fullName')}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary
                  ${errors.fullName ? 'border-danger' : 'border-border'}`}
              />
              {errors.fullName && (
                <p className='text-danger text-xs mt-1.5'>{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className='block text-sm font-medium text-text mb-1.5'>Email address</label>
              <input
                type='email'
                {...register('email')}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary
                  ${errors.email ? 'border-danger' : 'border-border'}`}
              />
              {errors.email && <p className='text-danger text-xs mt-1.5'>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className='block text-sm font-medium text-text mb-1.5'>Password</label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full px-4 py-2.5 pr-11 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary
                    ${errors.password ? 'border-danger' : 'border-border'}`}
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

            {/* Department — required for BOTH roles */}
            <div>
              <label className='block text-sm font-medium text-text mb-1.5'>Department</label>
              <select
                {...register('departmentId')}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary
                  ${errors.departmentId ? 'border-danger' : 'border-border'}`}
              >
                <option value=''>Select department</option>
                {departments?.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className='text-danger text-xs mt-1.5'>{errors.departmentId.message}</p>
              )}
            </div>

            {/* Student-only fields */}
            {selectedRole === 'student' && (
              <>
                <div>
                  <label className='block text-sm font-medium text-text mb-1.5'>
                    Matric Number
                  </label>
                  <input
                    {...register('matricNumber')}
                    placeholder='e.g. 2024513056'
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary
                      ${errors.matricNumber ? 'border-danger' : 'border-border'}`}
                  />
                  {errors.matricNumber && (
                    <p className='text-danger text-xs mt-1.5'>{errors.matricNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-text mb-1.5'>Level</label>
                  <select
                    {...register('level')}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary
                      ${errors.level ? 'border-danger' : 'border-border'}`}
                  >
                    <option value=''>Select level</option>
                    {LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl} Level
                      </option>
                    ))}
                  </select>
                  {errors.level && (
                    <p className='text-danger text-xs mt-1.5'>{errors.level.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Lecturer notice */}
            {selectedRole === 'lecturer' && (
              <p className='text-xs text-text-muted bg-bg border border-border rounded-lg p-3'>
                Lecturer accounts require admin activation before you can log in.
              </p>
            )}

            <button type='submit' disabled={isSubmitting} className='btn mt-2'>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className='text-center text-sm text-text-muted mt-6'>
          Already have an account?{' '}
          <Link to='/login' className='text-primary font-medium hover:underline'>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
