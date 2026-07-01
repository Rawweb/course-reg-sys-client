// src/components/ui/StatCard.jsx
// A summary card: a label, a big value, and an icon in a colored circle.

const StatCard = ({ label, value, icon: Icon, accent = 'primary' }) => {
  // Map an accent name to Tailwind classes for the icon circle.
  const accents = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-green-100 text-success',
    warning: 'bg-amber-100 text-warning',
    danger: 'bg-red-100 text-danger',
    info: 'bg-blue-100 text-info',
  };

  return (
    <div className='card flex items-center justify-between'>
      <div className='min-w-0'>
        <p className='text-xs font-medium uppercase tracking-wide text-text-muted truncate'>
          {label}
        </p>
        <p className='mt-1 text-lg font-bold text-text-heading truncate lg:text-xl'>{value}</p>
      </div>
      <div
        className={`ml-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${accents[accent]}`}
      >
        {Icon && <Icon size={22} />}
      </div>
    </div>
  );
};

export default StatCard;
