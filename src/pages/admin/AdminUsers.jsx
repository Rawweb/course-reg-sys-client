import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowUpCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { getUsers, toggleUserStatus, promoteStudent, bulkPromoteStudents } from '../../api/userApi';
import { getDepartments } from '../../api/departmentApi';
import ConfirmModal from '../../components/ConfirmModal';

const ROLES = ['student', 'lecturer', 'admin'];
const LEVELS = [100, 200, 300, 400, 500];

const AdminUsers = () => {
  const queryClient = useQueryClient();

  const [filterRole, setFilterRole] = useState('');

  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['users', filterRole],
    queryFn: () => getUsers(filterRole ? { role: filterRole } : {}),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  // Tracks a single user pending status-toggle confirmation
  const [togglingUser, setTogglingUser] = useState(null);
  // Tracks a single student pending promotion confirmation
  const [promotingUser, setPromotingUser] = useState(null);
  // Tracks whether the bulk promote modal is open
  const [bulkPromoteOpen, setBulkPromoteOpen] = useState(false);

  const toggleMutation = useMutation({
    mutationFn: toggleUserStatus,
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setTogglingUser(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update status'),
  });

  const promoteMutation = useMutation({
    mutationFn: promoteStudent,
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setPromotingUser(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to promote student'),
  });

  const bulkPromoteMutation = useMutation({
    mutationFn: bulkPromoteStudents,
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setBulkPromoteOpen(false);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Bulk promotion failed'),
  });

  if (isLoading) return <p className='text-text-muted'>Loading users...</p>;
  if (isError) return <p className='text-danger'>Failed to load users.</p>;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-text-heading'>Users</h1>
        <button
          onClick={() => setBulkPromoteOpen(true)}
          className='btn w-auto px-5 flex items-center gap-2'
        >
          <ArrowUpCircle size={16} />
          Bulk Promote
        </button>
      </div>

      {/* Role filter */}
      <select
        value={filterRole}
        onChange={(e) => setFilterRole(e.target.value)}
        className='px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
      >
        <option value=''>All Roles</option>
        {ROLES.map((role) => (
          <option key={role} value={role} className='capitalize'>
            {role}
          </option>
        ))}
      </select>

      <div className='card'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='text-left text-text-muted border-b border-border'>
              <th className='py-2 pr-4'>Name</th>
              <th className='py-2 pr-4'>Email</th>
              <th className='py-2 pr-4'>Role</th>
              <th className='py-2 pr-4'>Level/Semester</th>
              <th className='py-2 pr-4'>Department</th>
              <th className='py-2 pr-4'>Status</th>
              <th className='py-2'></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className='border-b border-border last:border-0'>
                <td className='py-3 pr-4 font-medium text-text-heading'>{user.fullName}</td>
                <td className='py-3 pr-4 text-text'>{user.email}</td>
                <td className='py-3 pr-4 text-text capitalize'>{user.role}</td>
                <td className='py-3 pr-4 text-text'>
                  {user.role === 'student'
                    ? `${user.studentInfo?.level}L · ${user.studentInfo?.currentSemester}`
                    : '—'}
                </td>
                <td className='py-3 pr-4 text-text'>{user.department?.code || '—'}</td>
                <td className='py-3 pr-4'>
                  <span className={user.isActive ? 'badge-approved' : 'badge-rejected'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className='py-3 flex items-center gap-3'>
                  {/* Activate/deactivate toggle — relevant for ALL roles,
                      but most commonly used for pending lecturer accounts */}
                  <button
                    onClick={() => setTogglingUser(user)}
                    title={user.isActive ? 'Deactivate' : 'Activate'}
                    className='text-text-muted hover:text-primary'
                  >
                    {user.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>

                  {/* Promote — only makes sense for students who haven't reached the final stage */}
                  {user.role === 'student' &&
                    !(
                      user.studentInfo?.level === 500 &&
                      user.studentInfo?.currentSemester === 'second'
                    ) && (
                      <button
                        onClick={() => setPromotingUser(user)}
                        title='Promote'
                        className='text-text-muted hover:text-success'
                      >
                        <ArrowUpCircle size={18} />
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {togglingUser && (
        <ConfirmModal
          title={togglingUser.isActive ? 'Deactivate User' : 'Activate User'}
          message={`${togglingUser.isActive ? 'Deactivate' : 'Activate'} "${togglingUser.fullName}"?`}
          confirmLabel={togglingUser.isActive ? 'Deactivate' : 'Activate'}
          isLoading={toggleMutation.isPending}
          onConfirm={() => toggleMutation.mutate(togglingUser._id)}
          onCancel={() => setTogglingUser(null)}
        />
      )}

      {promotingUser && (
        <ConfirmModal
          title='Promote Student'
          message={`Promote "${promotingUser.fullName}" from ${promotingUser.studentInfo?.level}L ${promotingUser.studentInfo?.currentSemester} semester to the next stage?`}
          confirmLabel='Promote'
          isLoading={promoteMutation.isPending}
          onConfirm={() => promoteMutation.mutate(promotingUser._id)}
          onCancel={() => setPromotingUser(null)}
        />
      )}

      {bulkPromoteOpen && (
        <BulkPromoteModal
          departments={departments || []}
          onClose={() => setBulkPromoteOpen(false)}
          onSubmit={(payload) => bulkPromoteMutation.mutate(payload)}
          isSubmitting={bulkPromoteMutation.isPending}
        />
      )}
    </div>
  );
};

// Separate modal since it needs its own department + optional level inputs,
// distinct from the simple "are you sure?" pattern of ConfirmModal
const BulkPromoteModal = ({ departments, onClose, onSubmit, isSubmitting }) => {
  const [departmentId, setDepartmentId] = useState('');
  const [level, setLevel] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!departmentId) {
      toast.error('Please select a department');
      return;
    }
    onSubmit({
      departmentId,
      ...(level && { level: Number(level) }),
    });
  };

  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50'>
      <form onSubmit={handleSubmit} className='card max-w-sm w-full'>
        <h2 className='font-semibold text-text-heading mb-2'>Bulk Promote Students</h2>
        <p className='text-sm text-text-muted mb-4'>
          Promotes every student in the selected department (optionally filtered to one level) to
          their next level/semester.
        </p>

        <div className='space-y-3'>
          <div>
            <label className='block text-sm font-medium text-text mb-1'>Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              required
              className='w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
            >
              <option value=''>Select department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-text mb-1'>
              Level (optional — leave blank for all levels)
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className='w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
            >
              <option value=''>All Levels</option>
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='flex gap-3 mt-5'>
          <button
            type='button'
            onClick={onClose}
            className='w-auto px-5 py-2.5 rounded-lg text-sm font-medium text-text border border-border'
          >
            Cancel
          </button>
          <button type='submit' disabled={isSubmitting} className='btn w-auto px-5'>
            {isSubmitting ? 'Promoting...' : 'Promote'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminUsers;
