import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAvailableCourses, submitRegistration } from '../../api/courseApi';
import { useAuth } from '../../context/AuthContext';
import CourseRow from '../../components/student/CourseRow';
import { SkeletonBlock } from '../../components/ui/Skeleton';
import { UNIT_RULES } from '../../utils/constants';

const AvailableCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [semester, setSemester] = useState(1); // chosen semester
  const [showCarryovers, setShowCarryovers] = useState(false); // the toggle
  const [selected, setSelected] = useState(new Set()); // picked course codes

  // Fetch available courses for the chosen semester.
  // The queryKey includes semester, so switching semester refetches.
  const { data, isLoading, isError } = useQuery({
    queryKey: ['available-courses', semester],
    queryFn: () => getAvailableCourses(semester),
  });

  const currentCourses = data?.currentCourses || [];
  const carryovers = data?.carryovers || [];

  // Toggle one course code in/out of the selected Set.
  const toggle = (code) => {
    setSelected((prev) => {
      const next = new Set(prev); // copy (never mutate state directly)
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  // Compute the live total units from the selected codes.
  // useMemo recomputes only when selection or data changes.
  const { totalUnits, hasCarryover } = useMemo(() => {
    const all = [...currentCourses, ...carryovers];
    let units = 0;
    let carry = false;
    all.forEach((c) => {
      if (selected.has(c.courseCode)) {
        units += c.unit;
        if (c.isCarryover) carry = true;
      }
    });
    return { totalUnits: units, hasCarryover: carry };
  }, [selected, currentCourses, carryovers]);

  // What's the max allowed right now (30 if a carryover is selected, else 24)?
  const maxAllowed = hasCarryover ? UNIT_RULES.MAX_CARRYOVER : UNIT_RULES.MAX_NORMAL;
  const isExempt = user?.level === UNIT_RULES.EXEMPT_LEVEL;

  // Submit mutation.
  const mutation = useMutation({
    mutationFn: () => submitRegistration([...selected], semester),
    onSuccess: () => {
      toast.success("Registration submitted! It's now pending approval.");
      // Refresh the dashboard + my-registrations data so they show the new reg.
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      navigate('/student/registration');
    },
    onError: (error) => {
      const res = error.response?.data;
      // The backend may return a list of validation errors.
      if (res?.errors?.length) {
        res.errors.forEach((e) => toast.error(e));
      } else {
        toast.error(res?.message || 'Registration failed.');
      }
    },
  });

  const handleSubmit = () => {
    if (selected.size === 0) {
      toast.error('Select at least one course.');
      return;
    }
    mutation.mutate();
  };

  return (
    <div>
      <h1 className='text-2xl font-bold text-text-heading'>Available Courses</h1>
      <p className='mt-1 text-sm text-text-muted'>
        {user?.department} · {user?.level} Level
      </p>

      {/* Semester toggle */}
      <div className='mt-6 flex gap-2'>
        {[1, 2].map((s) => (
          <button
            key={s}
            onClick={() => {
              setSemester(s);
              setSelected(new Set()); // clear selection when switching semester
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              semester === s
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text hover:border-primary/50'
            }`}
          >
            Semester {s}
          </button>
        ))}
      </div>

      {/* Loading / error / content */}
      {isLoading ? (
        <div className='mt-6 space-y-3'>
          {[...Array(6)].map((_, i) => (
            <SkeletonBlock key={i} className='h-16 w-full' />
          ))}
        </div>
      ) : isError ? (
        <p className='mt-6 text-sm text-danger'>Couldn't load courses. Try again.</p>
      ) : (
        <>
          {/* Current-level courses */}
          <div className='mt-6'>
            <h2 className='mb-3 text-lg font-semibold text-text-heading'>
              {user?.level} Level Courses
            </h2>
            <div className='space-y-2'>
              {currentCourses.map((c) => (
                <CourseRow
                  key={c.courseCode}
                  course={c}
                  checked={selected.has(c.courseCode)}
                  onToggle={toggle}
                />
              ))}
            </div>
          </div>

          {/* Carryover toggle + section */}
          {carryovers.length > 0 && (
            <div className='mt-6'>
              <button
                onClick={() => setShowCarryovers((v) => !v)}
                className='mb-3 flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover'
              >
                {showCarryovers ? 'Hide' : 'Show'} Carryovers ({carryovers.length})
              </button>
              {showCarryovers && (
                <div className='space-y-2'>
                  {carryovers.map((c) => (
                    <CourseRow
                      key={c.courseCode}
                      course={c}
                      checked={selected.has(c.courseCode)}
                      onToggle={toggle}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Sticky unit summary + submit bar */}
      {!isLoading && !isError && (
        <div className='sticky bottom-0 mt-6 -mx-4 border-t border-border bg-surface p-4 lg:-mx-8 lg:px-8'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='text-sm'>
              <span className='text-text-muted'>Selected: </span>
              <span className='font-semibold text-text-heading'>{selected.size} courses</span>
              <span className='mx-2 text-border'>|</span>
              <span className='text-text-muted'>Total: </span>
              <span
                className={`font-semibold ${
                  totalUnits > maxAllowed
                    ? 'text-danger'
                    : !isExempt && totalUnits < UNIT_RULES.MIN
                      ? 'text-warning'
                      : 'text-success'
                }`}
              >
                {totalUnits} units
              </span>
              <span className='ml-1 text-xs text-text-muted'>
                (min {UNIT_RULES.MIN}, max {maxAllowed}
                {isExempt ? ', min exempt' : ''})
              </span>
            </div>

            <button
              onClick={handleSubmit}
              className='btn sm:w-auto sm:px-8'
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableCourses;
