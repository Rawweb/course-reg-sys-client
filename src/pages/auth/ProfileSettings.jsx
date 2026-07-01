import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { changePasswordRequest } from '../../api/authApi';
import PasswordField from '../../components/ui/PasswordField';

// Validation for the change-password form.
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  // .refine adds a custom rule across fields: the two new passwords must match.
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'], // attach the error to the confirm field
  });

const ProfileSettings = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('personal'); // which tab is active

  // A small helper to render one read-only detail row.
  const Detail = ({ label, value }) =>
    value ? (
      <div>
        <p className='text-xs font-medium uppercase tracking-wide text-text-muted'>{label}</p>
        <p className='mt-1 text-sm font-medium text-text-heading'>{value}</p>
      </div>
    ) : null;

  // --- Password form ---
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(passwordSchema) });

  const mutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      changePasswordRequest(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully.');
      reset(); // clear the form fields after success
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Couldn't change password.");
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <div>
      <h1 className='text-2xl font-bold text-text-heading'>Profile Settings</h1>
      <p className='mt-1 text-sm text-text-muted'>View your details and manage your password.</p>

      {/* Tab buttons */}
      <div className='mt-6 flex gap-1 border-b border-border'>
        <button
          onClick={() => setTab('personal')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'personal'
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-muted hover:text-text'
          }`}
        >
          Personal Info
        </button>
        <button
          onClick={() => setTab('password')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'password'
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-muted hover:text-text'
          }`}
        >
          Password / Security
        </button>
      </div>

      {/* Panel: Personal Info */}
      {tab === 'personal' && (
        <div className='card mt-6'>
          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
            <Detail label='Full Name' value={user?.name} />
            <Detail label='Role' value={user?.role} />
            <Detail label='Matric Number' value={user?.matricNumber} />
            <Detail label='Staff ID' value={user?.staffId} />
            <Detail label='Email' value={user?.email} />
            <Detail label='Department' value={user?.department} />
            <Detail label='Level' value={user?.level ? `${user.level} Level` : null} />
          </div>
          <p className='mt-5 text-xs text-text-muted'>
            Your personal details are managed by the administration. Contact your department if
            anything is incorrect.
          </p>
        </div>
      )}

      {/* Panel: Password / Security */}
      {tab === 'password' && (
        <div className='card mt-6 max-w-md'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <label className='mb-1 block text-sm font-medium text-text'>Current Password</label>
              <PasswordField placeholder='Current password' {...register('currentPassword')} />
              {errors.currentPassword && (
                <p className='mt-1 text-xs text-danger'>{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className='mb-1 block text-sm font-medium text-text'>New Password</label>
              <PasswordField placeholder='New password' {...register('newPassword')} />
              {errors.newPassword && (
                <p className='mt-1 text-xs text-danger'>{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className='mb-1 block text-sm font-medium text-text'>
                Confirm New Password
              </label>
              <PasswordField placeholder='Confirm new password' {...register('confirmPassword')} />
              {errors.confirmPassword && (
                <p className='mt-1 text-xs text-danger'>{errors.confirmPassword.message}</p>
              )}
            </div>

            <button type='submit' className='btn' disabled={mutation.isPending}>
              {mutation.isPending ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
