import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getCourses, createCourse, updateCourse, deactivateCourse } from '../../api/courseApi';
import { getDepartments } from '../../api/departmentApi';
import ConfirmModal from '../../components/ConfirmModal';

const LEVELS = [100, 200, 300, 400, 500];
const SEMESTERS = ['first', 'second'];

const AdminCourses = () => {
  const queryClient = useQueryClient();

  // Filters for the TABLE view (not the form) — lets the admin
  // narrow down the (potentially 200+) course list to something manageable
  const [filterDept, setFilterDept] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const {
    data: courses,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['courses', filterDept, filterLevel, filterSemester],
    queryFn: () =>
      getCourses({
        ...(filterDept && { department: filterDept }),
        ...(filterLevel && { level: filterLevel }),
        ...(filterSemester && { semester: filterSemester }),
      }),
  });

  const [editingCourse, setEditingCourse] = useState(null);
  const [deactivatingCourse, setDeactivatingCourse] = useState(null);

  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      toast.success('Course created successfully');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setEditingCourse(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create course'),
  });

  const updateMutation = useMutation({
    mutationFn: updateCourse,
    onSuccess: () => {
      toast.success('Course updated successfully');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setEditingCourse(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update course'),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateCourse,
    onSuccess: () => {
      toast.success('Course deactivated successfully');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to deactivate course'),
  });

  const handleSave = (formValues) => {
    if (editingCourse._id) {
      updateMutation.mutate({ id: editingCourse._id, ...formValues });
    } else {
      createMutation.mutate(formValues);
    }
  };

  if (isLoading) return <p className='text-text-muted'>Loading courses...</p>;
  if (isError) return <p className='text-danger'>Failed to load courses.</p>;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-text-heading'>Courses</h1>
        <button
          onClick={() => setEditingCourse({})}
          className='btn w-auto px-5 flex items-center gap-2'
        >
          <Plus size={16} />
          Add Course
        </button>
      </div>

      {/* Filters */}
      <div className='flex gap-3'>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className='px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
        >
          <option value=''>All Departments</option>
          {departments?.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>

        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className='px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
        >
          <option value=''>All Levels</option>
          {LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl} Level
            </option>
          ))}
        </select>

        <select
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
          className='px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
        >
          <option value=''>All Semesters</option>
          {SEMESTERS.map((sem) => (
            <option key={sem} value={sem} className='capitalize'>
              {sem} Semester
            </option>
          ))}
        </select>
      </div>

      <div className='card'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='text-left text-text-muted border-b border-border'>
              <th className='py-2 pr-4'>Code</th>
              <th className='py-2 pr-4'>Title</th>
              <th className='py-2 pr-4'>Units</th>
              <th className='py-2 pr-4'>Level</th>
              <th className='py-2 pr-4'>Semester</th>
              <th className='py-2 pr-4'>Prerequisites</th>
              <th className='py-2'></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id} className='border-b border-border last:border-0'>
                <td className='py-3 pr-4 font-medium text-text-heading'>{course.courseCode}</td>
                <td className='py-3 pr-4 text-text'>{course.title}</td>
                <td className='py-3 pr-4 text-text'>{course.creditUnits}</td>
                <td className='py-3 pr-4 text-text'>{course.level}</td>
                <td className='py-3 pr-4 text-text capitalize'>{course.semester}</td>
                <td className='py-3 pr-4 text-text-muted'>
                  {course.prerequisites?.length > 0
                    ? course.prerequisites.map((p) => p.courseCode).join(', ')
                    : '—'}
                </td>
                <td className='py-3 flex gap-2'>
                  <button
                    onClick={() => setEditingCourse(course)}
                    className='text-text-muted hover:text-primary'
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeactivatingCourse(course)}
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

      {editingCourse && (
        <CourseModal
          course={editingCourse}
          departments={departments || []}
          onClose={() => setEditingCourse(null)}
          onSave={handleSave}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {deactivatingCourse && (
        <ConfirmModal
          title='Deactivate Course'
          message={`Deactivate "${deactivatingCourse.courseCode}"? This will hide it from active use but won't delete its data.`}
          confirmLabel='Deactivate'
          isLoading={deactivateMutation.isPending}
          onConfirm={() =>
            deactivateMutation.mutate(deactivatingCourse._id, {
              onSuccess: () => setDeactivatingCourse(null),
            })
          }
          onCancel={() => setDeactivatingCourse(null)}
        />
      )}
    </div>
  );
};

const CourseModal = ({ course, departments, onClose, onSave, isSaving }) => {
  const [formValues, setFormValues] = useState({
    title: course.title || '',
    courseCode: course.courseCode || '',
    creditUnits: course.creditUnits || 2,
    level: course.level || 100,
    semester: course.semester || 'first',
    department: course.department?._id || course.department || '',
    description: course.description || '',
    lecturer: course.lecturer || '',
    prerequisites: course.prerequisites?.map((p) => p._id) || [],
  });

  // Fetch ALL courses from the SAME department currently selected in the form,
  // so the prerequisite checklist only shows relevant options.
  // This re-fetches automatically whenever formValues.department changes,
  // because it's part of the query key.
  const { data: departmentCourses } = useQuery({
    queryKey: ['courses', 'for-prerequisites', formValues.department],
    queryFn: () => getCourses({ department: formValues.department }),
    enabled: Boolean(formValues.department), // don't fetch until a department is picked
  });

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  // Toggles one course ID in/out of the prerequisites array
  const togglePrerequisite = (courseId) => {
    setFormValues((prev) => {
      const exists = prev.prerequisites.includes(courseId);
      return {
        ...prev,
        prerequisites: exists
          ? prev.prerequisites.filter((id) => id !== courseId)
          : [...prev.prerequisites, courseId],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formValues);
  };

  const isEditing = Boolean(course._id);

  // Exclude the course being edited from its own prerequisite list —
  // a course cannot be a prerequisite of itself
  const availablePrereqs = (departmentCourses || []).filter((c) => c._id !== course._id);

  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50 overflow-y-auto py-8'>
      <form onSubmit={handleSubmit} className='card max-w-lg w-full'>
        <h2 className='font-semibold text-text-heading mb-4'>
          {isEditing ? 'Edit Course' : 'Add Course'}
        </h2>

        <div className='space-y-3 max-h-[60vh] overflow-y-auto pr-1'>
          <div>
            <label className='block text-sm font-medium text-text mb-1'>Title</label>
            <input
              value={formValues.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              className='w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-sm font-medium text-text mb-1'>Course Code</label>
              <input
                value={formValues.courseCode}
                onChange={(e) => handleChange('courseCode', e.target.value)}
                required
                className='w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-text mb-1'>Credit Units</label>
              <input
                type='number'
                value={formValues.creditUnits}
                onChange={(e) => handleChange('creditUnits', Number(e.target.value))}
                required
                className='w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-sm font-medium text-text mb-1'>Level</label>
              <select
                value={formValues.level}
                onChange={(e) => handleChange('level', Number(e.target.value))}
                className='w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-text mb-1'>Semester</label>
              <select
                value={formValues.semester}
                onChange={(e) => handleChange('semester', e.target.value)}
                className='w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
              >
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem} className='capitalize'>
                    {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-text mb-1'>Department</label>
            <select
              value={formValues.department}
              onChange={(e) => {
                // Changing department invalidates any previously selected
                // prerequisites, since they belonged to the OLD department
                handleChange('department', e.target.value);
                handleChange('prerequisites', []);
              }}
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
            <label className='block text-sm font-medium text-text mb-1'>Lecturer (optional)</label>
            <input
              value={formValues.lecturer}
              onChange={(e) => handleChange('lecturer', e.target.value)}
              className='w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
            />
          </div>

          {/* Prerequisites checklist — only shows once a department is selected */}
          {formValues.department && (
            <div>
              <label className='block text-sm font-medium text-text mb-1.5'>
                Prerequisites (same department only)
              </label>
              <div className='border border-border rounded-lg p-2 max-h-32 overflow-y-auto space-y-1'>
                {availablePrereqs.length === 0 ? (
                  <p className='text-xs text-text-muted px-1'>
                    No other courses in this department yet.
                  </p>
                ) : (
                  availablePrereqs.map((c) => (
                    <label key={c._id} className='flex items-center gap-2 text-sm px-1 py-0.5'>
                      <input
                        type='checkbox'
                        checked={formValues.prerequisites.includes(c._id)}
                        onChange={() => togglePrerequisite(c._id)}
                        className='w-3.5 h-3.5 accent-primary'
                      />
                      {c.courseCode} — {c.title}
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
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

export default AdminCourses;