import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { changePassword } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const ProfileSettings = () => {
  const { user } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (formData) => {
    try {
      const response = await changePassword(formData);
      toast.success(response.message || 'Password changed successfully');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className='space-y-6 max-w-lg'>
      <h1 className='text-2xl font-bold text-text-heading'>Profile Settings</h1>

      {/* Read-only account info */}
      <div className='card'>
        <h2 className='font-semibold text-text-heading mb-3'>Account Information</h2>
        <div className='space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span className='text-text-muted'>Full Name</span>
            <span className='text-text-heading font-medium'>{user?.fullName}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-text-muted'>Email</span>
            <span className='text-text-heading font-medium'>{user?.email}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-text-muted'>Role</span>
            <span className='text-text-heading font-medium capitalize'>{user?.role}</span>
          </div>
          {user?.role === 'student' && (
            <div className='flex justify-between'>
              <span className='text-text-muted'>Matric Number</span>
              <span className='text-text-heading font-medium'>
                {user?.studentInfo?.matricNumber}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Change password form */}
      <div className='card'>
        <h2 className='font-semibold text-text-heading mb-4'>Change Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-text mb-1.5'>Current Password</label>
            <div className='relative'>
              <input
                type={showCurrent ? 'text' : 'password'}
                {...register('currentPassword')}
                className={`w-full px-4 py-2.5 pr-11 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary
                  ${errors.currentPassword ? 'border-danger' : 'border-border'}`}
              />
              <button
                type='button'
                onClick={() => setShowCurrent(!showCurrent)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text'
              >
                {showCurrent ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className='text-danger text-xs mt-1.5'>{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-text mb-1.5'>New Password</label>
            <div className='relative'>
              <input
                type={showNew ? 'text' : 'password'}
                {...register('newPassword')}
                className={`w-full px-4 py-2.5 pr-11 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary
                  ${errors.newPassword ? 'border-danger' : 'border-border'}`}
              />
              <button
                type='button'
                onClick={() => setShowNew(!showNew)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text'
              >
                {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className='text-danger text-xs mt-1.5'>{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-text mb-1.5'>
              Confirm New Password
            </label>
            <input
              type='password'
              {...register('confirmPassword')}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary
                ${errors.confirmPassword ? 'border-danger' : 'border-border'}`}
            />
            {errors.confirmPassword && (
              <p className='text-danger text-xs mt-1.5'>{errors.confirmPassword.message}</p>
            )}
          </div>

          <button type='submit' disabled={isSubmitting} className='btn w-auto px-6'>
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
