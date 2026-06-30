import { useState } from 'react';
import { Eye, EyeOff, Mail, Hash, GraduationCap, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { changePassword } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

function PasswordField({ label, value, onChange, placeholder, error }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className='space-y-1.5'>
      <label className='block text-sm font-medium text-slate-600'>{label}</label>
      <div className='relative'>
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 ${
            error ? 'border-danger' : 'border-slate-300'
          }`}
        />
        <button
          type='button'
          onClick={() => setVisible((v) => !v)}
          className='absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600'
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className='text-danger text-xs'>{error}</p>}
    </div>
  );
}

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className='flex items-center gap-3'>
    <Icon size={16} className='text-slate-400' />
    <div>
      <dt className='text-xs text-slate-400'>{label}</dt>
      <dd className='text-sm text-slate-700'>{value || '-'}</dd>
    </div>
  </div>
);

export default function ProfileSettings() {
  const { user } = useAuth();
  const [formValues, setFormValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fullName = user?.fullName || 'User';
  const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';
  const firstInitial = fullName.charAt(0).toUpperCase();
  const departmentName = user?.department?.name || user?.department?.code;

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formValues.currentPassword) {
      nextErrors.currentPassword = 'Current password is required';
    }

    if (formValues.newPassword.length < 6) {
      nextErrors.newPassword = 'New password must be at least 6 characters';
    }

    if (formValues.newPassword !== formValues.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const response = await changePassword({
        currentPassword: formValues.currentPassword,
        newPassword: formValues.newPassword,
      });
      toast.success(response.message || 'Password changed successfully');
      setFormValues({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='w-full max-w-full overflow-x-hidden'>
      <div className='mx-auto w-full max-w-4xl'>
        <h1 className='text-2xl font-bold text-slate-900'>Profile Settings</h1>
        <p className='mt-1 text-sm text-slate-500'>Manage your account details and password.</p>

        <div className='mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[325px_minmax(0,560px)]'>
          <aside>
            <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
              <div className='flex flex-col items-center text-center'>
                <div className='flex h-20 w-20 items-center justify-center rounded-full bg-teal-600 text-2xl font-semibold text-white'>
                  {firstInitial}
                </div>
                <h2 className='mt-4 text-lg font-semibold text-slate-900'>{fullName}</h2>
                <span className='mt-1 inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700'>
                  {displayRole}
                </span>
              </div>

              <dl className='mt-6 space-y-4 border-t border-slate-100 pt-6'>
                <DetailRow icon={Mail} label='Email' value={user?.email} />
                {user?.role === 'student' && (
                  <DetailRow
                    icon={Hash}
                    label='Matric Number'
                    value={user?.studentInfo?.matricNumber}
                  />
                )}
                {departmentName && (
                  <DetailRow icon={Building2} label='Department' value={departmentName} />
                )}
                <DetailRow icon={GraduationCap} label='Role' value={displayRole} />
              </dl>
            </div>
          </aside>

          <section className='space-y-6'>
            <form
              onSubmit={handleSubmit}
              className='w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'
            >
              <h3 className='text-base font-semibold text-slate-900'>Change Password</h3>
              <p className='mt-1 text-sm text-slate-500'>
                Use a strong password you don&apos;t use anywhere else.
              </p>

              <div className='mt-6 w-full space-y-5'>
                <PasswordField
                  label='Current Password'
                  value={formValues.currentPassword}
                  onChange={(e) => handleChange('currentPassword', e.target.value)}
                  placeholder='Enter current password'
                  error={errors.currentPassword}
                />
                <PasswordField
                  label='New Password'
                  value={formValues.newPassword}
                  onChange={(e) => handleChange('newPassword', e.target.value)}
                  placeholder='Enter new password'
                  error={errors.newPassword}
                />
                <PasswordField
                  label='Confirm New Password'
                  value={formValues.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder='Re-enter new password'
                  error={errors.confirmPassword}
                />

                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-teal-200'
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
