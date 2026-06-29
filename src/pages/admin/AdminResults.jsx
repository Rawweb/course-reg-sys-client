import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { addBulkResults } from '../../api/resultApi';
import { getUsers } from '../../api/userApi';
import { getCourses } from '../../api/courseApi';

const GRADES = ['A', 'B', 'C', 'D', 'E', 'F'];

// One blank row template — used both for the initial row and
// whenever "Add Another Row" is clicked
const emptyRow = () => ({
  studentId: '',
  courseId: '',
  grade: '',
  session: '',
  semester: 'first',
  score: '',
  showAllLevels: false, // controls whether the course list is restricted to the student's current level
});

const AdminResults = () => {
  const [rows, setRows] = useState([emptyRow()]);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: students } = useQuery({
    queryKey: ['users', 'student'],
    queryFn: () => getUsers({ role: 'student' }),
  });

  const { mutate: submitResults, isPending } = useMutation({
    mutationFn: addBulkResults,
    onSuccess: (response) => {
      toast.success(response.message);
      setRows([emptyRow()]);
      setShowConfirm(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add results');
      setShowConfirm(false);
    },
  });

  const updateRow = (index, field, value) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Basic validation before allowing the confirm step to open —
  // catches empty required fields before we even ask "are you sure?"
  const validateRows = () => {
    for (const row of rows) {
      if (!row.studentId || !row.courseId || !row.grade || !row.session) {
        return false;
      }
    }
    return true;
  };

  const handleReviewClick = () => {
    if (!validateRows()) {
      toast.error('Please fill in all required fields for every row');
      return;
    }
    setShowConfirm(true);
  };

  const handleFinalSubmit = () => {
    // Strip out showAllLevels — it's a frontend-only UI concern,
    // the backend doesn't expect or need this field
    const payload = rows.map((row) => ({
      studentId: row.studentId,
      courseId: row.courseId,
      grade: row.grade,
      session: row.session,
      semester: row.semester,
      score: row.score ? Number(row.score) : undefined,
    }));
    submitResults(payload);
  };

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-text-heading'>Enter Results</h1>

      <div className='card space-y-4'>
        {rows.map((row, index) => (
          <ResultRow
            key={index}
            row={row}
            index={index}
            students={students}
            canRemove={rows.length > 1}
            onUpdate={updateRow}
            onRemove={removeRow}
          />
        ))}

        <button
          type='button'
          onClick={addRow}
          className='flex items-center gap-2 text-sm text-primary font-medium hover:underline'
        >
          <Plus size={16} />
          Add Another Row
        </button>
      </div>

      <button onClick={handleReviewClick} className='btn w-auto px-6'>
        Review and Submit
      </button>

      {showConfirm && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50'>
          <div className='card max-w-md w-full'>
            <h2 className='font-semibold text-text-heading mb-2'>Confirm Result Entry</h2>
            <p className='text-sm text-text-muted mb-5'>
              You are about to submit <strong>{rows.length}</strong> result
              {rows.length > 1 ? 's' : ''}. This action <strong>cannot be undone</strong> — please
              verify every grade and course carefully before confirming.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setShowConfirm(false)}
                className='w-auto px-5 py-2.5 rounded-lg text-sm font-medium text-text border border-border flex-1'
              >
                Go Back and Check
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isPending}
                className='btn w-auto px-5 flex-1'
              >
                {isPending ? 'Submitting...' : 'Confirm and Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// One row of the results form. Each row independently fetches its own
// course list, since that list depends on which student THIS row has selected.
const ResultRow = ({ row, index, students, canRemove, onUpdate, onRemove }) => {
  const selectedStudent = students?.find((s) => s._id === row.studentId);
  const departmentId = selectedStudent?.department?._id || selectedStudent?.department;
  const studentLevel = selectedStudent?.studentInfo?.level;

  // Build the filter dynamically:
  // - always scoped to the student's department
  // - scoped to their CURRENT level too, UNLESS the admin
  //   explicitly checked "show all levels" for this row
  const courseFilter = {
    department: departmentId,
    ...(!row.showAllLevels && studentLevel && { level: studentLevel }),
  };

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', 'for-results', departmentId, row.showAllLevels ? 'all' : studentLevel],
    queryFn: () => getCourses(courseFilter),
    enabled: Boolean(departmentId),
  });

  return (
    <div className='grid grid-cols-12 gap-2 items-end border-b border-border pb-4 last:border-0 last:pb-0'>
      <div className='col-span-3'>
        <label className='block text-xs font-medium text-text mb-1'>Student</label>
        <select
          value={row.studentId}
          onChange={(e) => {
            onUpdate(index, 'studentId', e.target.value);
            // Reset the course selection whenever the student changes,
            // since the previous course choice belonged to a different student/department
            onUpdate(index, 'courseId', '');
          }}
          className='w-full px-2 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
        >
          <option value=''>Select student</option>
          {students?.map((s) => (
            <option key={s._id} value={s._id}>
              {s.studentInfo?.matricNumber} — {s.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className='col-span-3'>
        <div className='flex items-center justify-between mb-1'>
          <label className='block text-xs font-medium text-text'>Course</label>
          {row.studentId && (
            <label className='flex items-center gap-1 text-xs text-text-muted cursor-pointer'>
              <input
                type='checkbox'
                checked={row.showAllLevels}
                onChange={(e) => {
                  onUpdate(index, 'showAllLevels', e.target.checked);
                  onUpdate(index, 'courseId', '');
                }}
                className='w-3 h-3 accent-primary'
              />
              All levels
            </label>
          )}
        </div>
        <select
          value={row.courseId}
          onChange={(e) => onUpdate(index, 'courseId', e.target.value)}
          disabled={!row.studentId}
          className='w-full px-2 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary disabled:bg-bg disabled:cursor-not-allowed'
        >
          <option value=''>
            {!row.studentId
              ? 'Select student first'
              : coursesLoading
                ? 'Loading courses...'
                : 'Select course'}
          </option>
          {courses?.map((c) => (
            <option key={c._id} value={c._id}>
              {c.courseCode} — {c.title} ({c.level}L)
            </option>
          ))}
        </select>
      </div>

      <div className='col-span-1'>
        <label className='block text-xs font-medium text-text mb-1'>Grade</label>
        <select
          value={row.grade}
          onChange={(e) => onUpdate(index, 'grade', e.target.value)}
          className='w-full px-2 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
        >
          <option value=''>—</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div className='col-span-2'>
        <label className='block text-xs font-medium text-text mb-1'>Session</label>
        <input
          value={row.session}
          onChange={(e) => onUpdate(index, 'session', e.target.value)}
          placeholder='2024/2025'
          className='w-full px-2 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
        />
      </div>

      <div className='col-span-1'>
        <label className='block text-xs font-medium text-text mb-1'>Sem</label>
        <select
          value={row.semester}
          onChange={(e) => onUpdate(index, 'semester', e.target.value)}
          className='w-full px-2 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
        >
          <option value='first'>1st</option>
          <option value='second'>2nd</option>
        </select>
      </div>

      <div className='col-span-1'>
        <label className='block text-xs font-medium text-text mb-1'>Score</label>
        <input
          type='number'
          value={row.score}
          onChange={(e) => onUpdate(index, 'score', e.target.value)}
          className='w-full px-2 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
        />
      </div>

      <div className='col-span-1 flex justify-center'>
        {canRemove && (
          <button
            type='button'
            onClick={() => onRemove(index)}
            className='text-text-muted hover:text-danger'
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminResults;
