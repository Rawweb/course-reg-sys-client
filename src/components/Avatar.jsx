import getInitials from '../utils/getInitials';

const Avatar = ({ name, size = 'md' }) => {
  const initials = getInitials(name);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-primary text-white font-semibold
        flex items-center justify-center flex-shrink-0`}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;
