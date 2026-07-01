// src/pages/student/AvailableCourses.jsx
// Browse current-level + carryover courses, select, see live units, submit.
// If already registered for the chosen semester, the page becomes read-only.

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2, Lock } from 'lucide-react';
import { getAvailableCourses, submitRegistration, getMyRegistrations } from '../../api/courseApi';
import { useAuth } from '../../context/AuthContext';
import CourseRow from '../../components/student/CourseRow';
import { SkeletonBlock } from '../../components/ui/Skeleton';
import { UNIT_RULES, CURRENT_SESSION } from '../../utils/constants';

const AvailableCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [semester, setSemester] = useState(1);
  const [showCarryovers, setShowCarryovers] = useState(false);
  const [selected, setSelected] = useState(new Set());

  // Query 1: available courses for the chosen semester.
  const {
    data: coursesData,
    isLoading: coursesLoading,
    isError,
  } = useQuery({
    queryKey: ['available-courses', semester],
    queryFn: () => getAvailableCourses(semester),
  });

  // Query 2: the student's existing registrations (to detect a lock).
  const { data: regData, isLoading: regLoading } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: getMyRegistrations,
  });

  const currentCourses = coursesData?.currentCourses || [];
  const carryovers = coursesData?.carryovers || [];

  // Is there ALREADY a registration for this session + semester?
  // If so, the page locks (one registration per semester rule).
  const existingReg = (regData?.registrations || []).find(
    (r) => r.session === CURRENT_SESSION && r.semester === semester,
  );
  const isLocked = !!existingReg;

  const toggle = (code) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

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

  const maxAllowed = hasCarryover ? UNIT_RULES.MAX_CARRYOVER : UNIT_RULES.MAX_NORMAL;
  const isExempt = user?.level === UNIT_RULES.EXEMPT_LEVEL;

  const mutation = useMutation({
    mutationFn: () => submitRegistration([...selected], semester),
    onSuccess: () => {
      toast.success("Registration submitted! It's now pending approval.");
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      navigate('/student/registration');
    },
    onError: (error) => {
      const res = error.response?.data;
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

  const loading = coursesLoading || regLoading;

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
              setSelected(new Set());
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

      {loading ? (
        <div className='mt-6 space-y-3'>
          {[...Array(6)].map((_, i) => (
            <SkeletonBlock key={i} className='h-16 w-full' />
          ))}
        </div>
      ) : isError ? (
        <p className='mt-6 text-sm text-danger'>Couldn't load courses. Try again.</p>
      ) : isLocked ? (
        // ===== LOCKED STATE: already registered for this semester =====
        <div className='mt-6'>
          <div className='flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4'>
            <CheckCircle2 className='mt-0.5 shrink-0 text-success' size={20} />
            <div>
              <p className='text-sm font-semibold text-green-800'>
                You've already registered for Semester {semester}
              </p>
              <p className='text-sm text-green-700'>
                Status: <span className='capitalize font-medium'>{existingReg.status}</span>. You
                can view the details on your registration page.
              </p>
              <Link
                to='/student/registration'
                className='mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm
                           font-medium text-white hover:bg-primary-hover transition-colors'
              >
                View My Registration
              </Link>
            </div>
          </div>

          {/* Show the registered courses, locked (greyed, non-interactive) */}
          <div className='mt-6 space-y-2'>
            {existingReg.courses.map((c) => (
              <div
                key={c.courseCode}
                className='flex items-center gap-3 rounded-lg border border-border bg-slate-50 p-3'
              >
                <Lock size={16} className='shrink-0 text-text-muted' />
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='font-semibold text-text-heading'>{c.courseCode}</span>
                    <span className='text-xs text-text-muted'>
                      {c.unit} unit{c.unit === 1 ? '' : 's'}
                    </span>
                    {c.isCarryover && (
                      <span className='rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700'>
                        Carryover
                      </span>
                    )}
                  </div>
                  <p className='mt-0.5 text-sm text-text truncate'>{c.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // ===== NORMAL SELECTABLE STATE =====
        <>
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

          {/* Sticky unit summary + submit bar */}
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
        </>
      )}
    </div>
  );
};

export default AvailableCourses;
