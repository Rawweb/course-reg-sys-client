import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getAvailableCourses,
  createRegistration,
  getMyRegistrations,
} from '../../api/registrationApi';

const AvailableCourses = () => {
  // Tracks whether the carryover toggle is on
  const [showCarryover, setShowCarryover] = useState(false);

  // Tracks which course IDs the student has checked
  // We use a Set because checking "is this ID selected?" and
  // adding/removing IDs is faster and cleaner than array methods
  const [selectedIds, setSelectedIds] = useState(new Set());

  const queryClient = useQueryClient();

  // useQuery's "key" array is critical: ["available-courses", showCarryover]
  // When showCarryover changes (true -> false or vice versa), React Query
  // treats it as a DIFFERENT cache entry and automatically re-fetches
  const { data, isLoading, isError } = useQuery({
    queryKey: ['available-courses', showCarryover],
    queryFn: () => getAvailableCourses(showCarryover),
  });

  // Fetch the student's existing registration so we know which
  // courses (if any) are already registered/approved
  const { data: myRegistrations } = useQuery({
    queryKey: ['my-registration'],
    queryFn: getMyRegistrations,
  });

  const latestRegistration = myRegistrations?.[0];
  const isLocked = latestRegistration?.status === 'approved';

  // Once we know the student's existing registration, pre-check
  // whichever courses are already part of it — otherwise the page
  // looks like nothing has been registered, even when something has
  useEffect(() => {
    if (latestRegistration) {
      const existingIds = latestRegistration.courses.map((item) => item.course._id);
      setSelectedIds(new Set(existingIds));
    }
  }, [latestRegistration]);

  // useMutation handles the "submit registration" action —
  // unlike useQuery (for GET requests), useMutation is for
  // anything that CHANGES data (POST, PUT, DELETE)
  const { mutate: register, isPending: isRegistering } = useMutation({
    mutationFn: createRegistration,
    onSuccess: (response) => {
      toast.success(response.message || 'Registration successful');
      queryClient.invalidateQueries({ queryKey: ['my-registration'] });
    },
    onError: (error) => {
      const errors = error.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        // Prerequisite errors come back as an array — show each one
        errors.forEach((err) => toast.error(err.message));
      } else {
        const message = error.response?.data?.message || 'Registration failed';
        const unitError = error.response?.data?.error;
        toast.error(unitError || message);
      }
    },
  });

  // Toggles a single course's selection state on/off
  const toggleCourse = (courseId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  if (isLoading) {
    return <p className='text-text-muted'>Loading available courses...</p>;
  }

  if (isError) {
    return <p className='text-danger'>Failed to load courses. Please try again.</p>;
  }

  const { regularCourses = [], carryoverCourses = [] } = data || {};

  // Combine both lists so we can calculate the running total
  // across whatever the student has selected, regardless of which list it came from
  const allCourses = [...regularCourses, ...carryoverCourses];
  const selectedCourses = allCourses.filter((c) => selectedIds.has(c._id));
  const totalUnits = selectedCourses.reduce((sum, c) => sum + c.creditUnits, 0);

  const handleSubmit = () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one course');
      return;
    }

    register({
      courseIds: Array.from(selectedIds),
      session: '2024/2025', // we'll make this dynamic later
      semester: regularCourses[0]?.semester || 'first',
    });
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-text-heading'>Available Courses</h1>

        {/* Carryover toggle */}
        <label className='flex items-center gap-2 text-sm font-medium text-text cursor-pointer'>
          <input
            type='checkbox'
            checked={showCarryover}
            onChange={(e) => setShowCarryover(e.target.checked)}
            className='w-4 h-4 accent-primary'
          />
          Show Carryover Courses
        </label>
      </div>

      {isLocked && (
        <div className='bg-green-50 border border-success/20 rounded-lg p-3'>
          <p className='text-sm text-success font-medium'>
            Your registration has already been approved. Checked courses below reflect your
            confirmed registration and cannot be changed.
          </p>
        </div>
      )}

      {/* Regular courses table */}
      <CourseTable
        title='Current Semester Courses'
        courses={regularCourses}
        selectedIds={selectedIds}
        onToggle={toggleCourse}
        disabled={isLocked}
      />

      {/* Carryover courses table — only shown when toggle is on */}
      {showCarryover && (
        <CourseTable
          title='Carryover Courses'
          courses={carryoverCourses}
          selectedIds={selectedIds}
          onToggle={toggleCourse}
          disabled={isLocked}
        />
      )}

      {/* Sticky summary bar */}
      <div className='card flex items-center justify-between sticky bottom-4'>
        <div>
          <p className='text-sm text-text-muted'>Selected Courses: {selectedCourses.length}</p>
          <p className='text-lg font-bold text-text-heading'>Total Units: {totalUnits}</p>
          {isLocked && (
            <p className='text-xs text-success mt-1'>
              Your registration is approved — these are your confirmed courses.
            </p>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={isRegistering || isLocked}
          className='btn w-auto px-6'
        >
          {isLocked
            ? 'Already Approved'
            : isRegistering
              ? 'Submitting...'
              : 'Register Selected Courses'}
        </button>
      </div>
    </div>
  );
};

// Small reusable sub-component for rendering one course table
// We define it in the same file since it's only used here, but
// kept separate for readability
const CourseTable = ({ title, courses, selectedIds, onToggle, disabled }) => {
  if (courses.length === 0) {
    return (
      <div className='card'>
        <h2 className='font-semibold text-text-heading mb-3'>{title}</h2>
        <p className='text-text-muted text-sm'>No courses found.</p>
      </div>
    );
  }

  return (
    <div className='card'>
      <h2 className='font-semibold text-text-heading mb-3'>{title}</h2>
      <table className='w-full text-sm'>
        <thead>
          <tr className='text-left text-text-muted border-b border-border'>
            <th className='py-2 pr-4 w-10'></th>
            <th className='py-2 pr-4'>Code</th>
            <th className='py-2 pr-4'>Title</th>
            <th className='py-2 pr-4'>Units</th>
            <th className='py-2'>Prerequisite</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course._id} className='border-b border-border last:border-0'>
              <td className='py-3 pr-4'>
                <input
                  type='checkbox'
                  checked={selectedIds.has(course._id)}
                  onChange={() => onToggle(course._id)}
                  disabled={disabled}
                  className='w-4 h-4 accent-primary disabled:opacity-50 disabled:cursor-not-allowed'
                />
              </td>
              <td className='py-3 pr-4 font-medium text-text-heading'>{course.courseCode}</td>
              <td className='py-3 pr-4 text-text'>{course.title}</td>
              <td className='py-3 pr-4 text-text'>{course.creditUnits}</td>
              <td className='py-3 text-text-muted'>
                {course.prerequisites?.length > 0
                  ? course.prerequisites.map((p) => p.courseCode).join(', ')
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AvailableCourses;
