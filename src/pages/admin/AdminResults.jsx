import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { addBulkResults, getGradeableCourses } from '../../api/resultApi';
import { getUsers } from '../../api/userApi';

const GRADES = ['A', 'B', 'C', 'D', 'E', 'F'];

const AdminResults = () => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  // Tracks per-course grade/score entries, keyed by a unique string
  // combining course + session + semester (since the same course could
  // appear twice if a student retook it in a different session)
  const [entries, setEntries] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  const queryClient = useQueryClient();

  const { data: students } = useQuery({
    queryKey: ['users', 'student'],
    queryFn: () => getUsers({ role: 'student' }),
  });

  const { data: gradeableCourses, isLoading: gradeableLoading } = useQuery({
    queryKey: ['gradeable-courses', selectedStudentId],
    queryFn: () => getGradeableCourses(selectedStudentId),
    enabled: Boolean(selectedStudentId),
  });

  const { mutate: submitResults, isPending } = useMutation({
    mutationFn: addBulkResults,
    onSuccess: (response) => {
      toast.success(response.message);
      setEntries({});
      setShowConfirm(false);
      // Refresh the gradeable list — graded courses should now disappear from it
      queryClient.invalidateQueries({ queryKey: ['gradeable-courses', selectedStudentId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add results');
      setShowConfirm(false);
    },
  });

  const getEntryKey = (courseId, session, semester) => `${courseId}_${session}_${semester}`;

  const toggleCourseChecked = (item) => {
    const key = getEntryKey(item.course._id, item.session, item.semester);
    setEntries((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = {
          studentId: selectedStudentId,
          courseId: item.course._id,
          session: item.session,
          semester: item.semester,
          grade: '',
          score: '',
        };
      }
      return next;
    });
  };

  const updateEntry = (key, field, value) => {
    setEntries((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const checkedEntries = Object.entries(entries);

  const handleReviewClick = () => {
    if (checkedEntries.length === 0) {
      toast.error('Please select at least one course to grade');
      return;
    }
    const missingGrade = checkedEntries.some(([, entry]) => !entry.grade);
    if (missingGrade) {
      toast.error('Please select a grade for every checked course');
      return;
    }
    setShowConfirm(true);
  };

  const handleFinalSubmit = () => {
    const payload = checkedEntries.map(([, entry]) => ({
      studentId: entry.studentId,
      courseId: entry.courseId,
      session: entry.session,
      semester: entry.semester,
      grade: entry.grade,
      score: entry.score ? Number(entry.score) : undefined,
    }));
    submitResults(payload);
  };

  const selectedStudent = students?.find((s) => s._id === selectedStudentId);

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-text-heading'>Enter Results</h1>

      {/* Step 1: pick a student */}
      <div className='card'>
        <label className='block text-sm font-medium text-text mb-1.5'>Select Student</label>
        <select
          value={selectedStudentId}
          onChange={(e) => {
            setSelectedStudentId(e.target.value);
            setEntries({}); // clear any checked entries from the previous student
          }}
          className='w-full max-w-md px-3 py-2 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary'
        >
          <option value=''>Select a student</option>
          {students?.map((s) => (
            <option key={s._id} value={s._id}>
              {s.studentInfo?.matricNumber} — {s.fullName}
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: show their gradeable courses */}
      {selectedStudentId && (
        <div className='card'>
          <h2 className='font-semibold text-text-heading mb-1'>
            Gradeable Courses for {selectedStudent?.fullName}
          </h2>
          <p className='text-xs text-text-muted mb-4'>
            Only courses from approved registrations without an existing result are shown.
          </p>

          {gradeableLoading ? (
            <p className='text-text-muted text-sm'>Loading...</p>
          ) : gradeableCourses?.length === 0 ? (
            <p className='text-text-muted text-sm'>
              No gradeable courses found — this student may have no approved registration, or
              already has results recorded for everything they're registered for.
            </p>
          ) : (
            <div className='space-y-3'>
              {gradeableCourses.map((item) => {
                const key = getEntryKey(item.course._id, item.session, item.semester);
                const isChecked = Boolean(entries[key]);

                return (
                  <div
                    key={key}
                    className='grid grid-cols-12 gap-3 items-center border-b border-border pb-3 last:border-0 last:pb-0'
                  >
                    <div className='col-span-1'>
                      <input
                        type='checkbox'
                        checked={isChecked}
                        onChange={() => toggleCourseChecked(item)}
                        className='w-4 h-4 accent-primary'
                      />
                    </div>

                    <div className='col-span-5'>
                      <p className='text-sm font-medium text-text-heading'>
                        {item.course.courseCode} — {item.course.title}
                      </p>
                      <p className='text-xs text-text-muted'>
                        {item.session} · {item.semester} semester · {item.course.creditUnits} units
                      </p>
                    </div>

                    <div className='col-span-3'>
                      <select
                        value={entries[key]?.grade || ''}
                        onChange={(e) => updateEntry(key, 'grade', e.target.value)}
                        disabled={!isChecked}
                        className='w-full px-2 py-1.5 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary disabled:bg-bg disabled:cursor-not-allowed'
                      >
                        <option value=''>Grade</option>
                        {GRADES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className='col-span-3'>
                      <input
                        type='number'
                        placeholder='Score (optional)'
                        value={entries[key]?.score || ''}
                        onChange={(e) => updateEntry(key, 'score', e.target.value)}
                        disabled={!isChecked}
                        className='w-full px-2 py-1.5 rounded-lg border border-border text-sm outline-none focus:ring-2 focus:ring-primary disabled:bg-bg disabled:cursor-not-allowed'
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedStudentId && gradeableCourses?.length > 0 && (
        <button onClick={handleReviewClick} className='btn w-auto px-6'>
          Review and Submit ({checkedEntries.length} selected)
        </button>
      )}

      {showConfirm && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50'>
          <div className='card max-w-md w-full'>
            <h2 className='font-semibold text-text-heading mb-2'>Confirm Result Entry</h2>
            <p className='text-sm text-text-muted mb-5'>
              You are about to submit <strong>{checkedEntries.length}</strong> result
              {checkedEntries.length > 1 ? 's' : ''} for{' '}
              <strong>{selectedStudent?.fullName}</strong>. This action{' '}
              <strong>cannot be undone</strong> — please verify every grade carefully before
              confirming.
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

export default AdminResults;
