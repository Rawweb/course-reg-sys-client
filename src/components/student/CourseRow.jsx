import { Lock } from 'lucide-react';

const CourseRow = ({ course, checked, onToggle }) => {
  const disabled = !course.eligible; 

  return (
    <label
      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
        disabled
          ? 'cursor-not-allowed border-border bg-slate-50'
          : checked
            ? 'cursor-pointer border-primary bg-primary/5'
            : 'cursor-pointer border-border hover:border-primary/50'
      }`}
    >
      {/* Checkbox — disabled for blocked courses */}
      <input
        type='checkbox'
        className='mt-1 h-4 w-4 accent-primary'
        checked={checked}
        disabled={disabled}
        onChange={() => onToggle(course.courseCode)}
      />

      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='font-semibold text-text-heading'>{course.courseCode}</span>
          <span className='text-xs text-text-muted'>
            {course.unit} unit{course.unit === 1 ? '' : 's'}
          </span>
          {course.isCarryover && (
            <span className='rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700'>
              Carryover
            </span>
          )}
        </div>
        <p className='mt-0.5 text-sm text-text truncate'>{course.title}</p>

        {/* If blocked, show WHY — the whole point of prerequisite validation */}
        {disabled && (
          <p className='mt-1 flex items-center gap-1 text-xs text-danger'>
            <Lock size={12} />
            {course.blockedReason}
          </p>
        )}
      </div>
    </label>
  );
};

export default CourseRow;
