// A simple circular progress ring built with raw SVG.
// value/max determine how much of the ring is filled.
const CircularProgress = ({ value, max, label, sublabel }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  // Cap the percentage at 100 visually, even if value somehow exceeds max
  // (shouldn't happen given our backend validation, but defensive nonetheless)
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  // Color shifts based on how close to the limit the student is —
  // gives an at-a-glance sense of "comfortable" vs "near the cap"
  const strokeColor =
    percentage >= 90
      ? 'var(--color-danger)'
      : percentage >= 70
        ? 'var(--color-secondary)'
        : 'var(--color-primary)';

  return (
    <div className='flex flex-col items-center'>
      <svg width='130' height='130' viewBox='0 0 130 130'>
        {/* Background track */}
        <circle
          cx='65'
          cy='65'
          r={radius}
          fill='none'
          stroke='var(--color-border)'
          strokeWidth='10'
        />
        {/* Filled progress arc */}
        <circle
          cx='65'
          cy='65'
          r={radius}
          fill='none'
          stroke={strokeColor}
          strokeWidth='10'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap='round'
          // Rotate so the arc starts from the top (12 o'clock) instead of the default 3 o'clock
          transform='rotate(-90 65 65)'
        />
        <text
          x='65'
          y='60'
          textAnchor='middle'
          className='text-2xl font-bold'
          fill='var(--color-text-heading)'
        >
          {value}
        </text>
        <text x='65' y='80' textAnchor='middle' className='text-xs' fill='var(--color-text-muted)'>
          {label}
        </text>
      </svg>
      {sublabel && <p className='text-xs text-text-muted mt-2'>{sublabel}</p>}
    </div>
  );
};

export default CircularProgress;
