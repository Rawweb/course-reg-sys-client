import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deactivateDepartment,
} from '../../api/departmentApi';
import ConfirmModal from '../../components/ConfirmModal';

const AdminDepartments = () => {
  const queryClient = useQueryClient();

  const {
    data: departments,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const [editingDept, setEditingDept] = useState(null);
  const [deactivatingDept, setDeactivatingDept] = useState(null);
  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      toast.success('Department created successfully');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setEditingDept(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create department'),
  });

  const updateMutation = useMutation({
    mutationFn: updateDepartment,
    onSuccess: () => {
      toast.success('Department updated successfully');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setEditingDept(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update department'),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateDepartment,
    onSuccess: () => {
      toast.success('Department deactivated successfully');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || 'Failed to deactivate department'),
  });

  const handleConfirmDeactivate = () => {
    deactivateMutation.mutate(deactivatingDept._id, {
      onSuccess: () => {
        setDeactivatingDept(null);
      },
    });
  };

  const handleSave = (formValues) => {
    if (editingDept._id) {
      // Has an _id, so it's an existing department — update it
      updateMutation.mutate({ id: editingDept._id, ...formValues });
    } else {
      // No _id, so it's a brand new department — create it
      createMutation.mutate(formValues);
    }
  };

  if (isLoading) return <p className='text-text-muted'>Loading departments...</p>;
  if (isError) return <p className='text-danger'>Failed to load departments.</p>;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-text-heading'>Departments</h1>
        <button
          onClick={() => setEditingDept({})}
          className='btn w-auto px-5 flex items-center gap-2'
        >
          <Plus size={16} />
          Add Department
        </button>
      </div>

      <div className='card'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='text-left text-text-muted border-b border-border'>
              <th className='py-2 pr-4'>Name</th>
              <th className='py-2 pr-4'>Code</th>
              <th className='py-2 pr-4'>Faculty</th>
              <th className='py-2 pr-4'>Min/Max Units</th>
              <th className='py-2'></th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept._id} className='border-b border-border last:border-0'>
                <td className='py-3 pr-4 font-medium text-text-heading'>{dept.name}</td>
                <td className='py-3 pr-4 text-text'>{dept.code}</td>
                <td className='py-3 pr-4 text-text'>{dept.faculty}</td>
                <td className='py-3 pr-4 text-text'>
                  {dept.minUnitsPerSemester} / {dept.maxUnitsPerSemester}
                </td>
                <td className='py-3 flex gap-2'>
                  <button
                    onClick={() => setEditingDept(dept)}
                    className='text-text-muted hover:text-primary'
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeactivatingDept(dept)}
                    className='text-text-muted hover:text-danger'
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingDept && (
        <DepartmentModal
          department={editingDept}
          onClose={() => setEditingDept(null)}
          onSave={handleSave}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}
      {deactivatingDept && (
        <ConfirmModal
          title='Deactivate Department'
          message={`Deactivate "${deactivatingDept.name}"? This will hide it from active use but won't delete its data.`}
          confirmLabel='Deactivate'
          isLoading={deactivateMutation.isPending}
          onConfirm={handleConfirmDeactivate}
          onCancel={() => setDeactivatingDept(null)}
        />
      )}
    </div>
  );
};

// One shared modal/form for BOTH creating and editing —
// it just pre-fills its inputs from `department` if values already exist
const DepartmentModal = ({ department, onClose, onSave, isSaving }) => {
  const [formValues, setFormValues] = useState({
    name: department.name || '',
    code: department.code || '',
    faculty: department.faculty || '',
    minUnitsPerSemester: department.minUnitsPerSemester || 15,
    maxUnitsPerSemester: department.maxUnitsPerSemester || 24,
    maxUnitsWithCarryover: department.maxUnitsWithCarryover || 30,
  });

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formValues);
  };

  const isEditing = Boolean(department._id);

  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50'>
      <form onSubmit={handleSubmit} className='card max-w-md w-full'>
        <h2 className='font-semibold text-text-heading mb-4'>
          {isEditing ? 'Edit Department' : 'Add Department'}
        </h2>

        <div className='space-y-3'>
          <div>
            <label className='block text-sm font-medium text-text mb-1'>Name</label>
            <input
              value={formValues.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className='w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-text mb-1'>Code</label>
            <input
              value={formValues.code}
              onChange={(e) => handleChange('code', e.target.value)}
              required
              className='w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-text mb-1'>Faculty</label>
            <input
              value={formValues.faculty}
              onChange={(e) => handleChange('faculty', e.target.value)}
              required
              className='w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
            />
          </div>

          <div className='grid grid-cols-3 gap-3'>
            <div>
              <label className='block text-sm font-medium text-text mb-1'>Min Units</label>
              <input
                type='number'
                value={formValues.minUnitsPerSemester}
                onChange={(e) => handleChange('minUnitsPerSemester', Number(e.target.value))}
                className='w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-text mb-1'>Max Units</label>
              <input
                type='number'
                value={formValues.maxUnitsPerSemester}
                onChange={(e) => handleChange('maxUnitsPerSemester', Number(e.target.value))}
                className='w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-text mb-1'>Carryover Max</label>
              <input
                type='number'
                value={formValues.maxUnitsWithCarryover}
                onChange={(e) => handleChange('maxUnitsWithCarryover', Number(e.target.value))}
                className='w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
              />
            </div>
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
          <button type='submit' disabled={isSaving} className='btn w-auto px-5'>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminDepartments;
