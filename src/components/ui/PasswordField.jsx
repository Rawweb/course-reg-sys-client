import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordField = forwardRef(({ placeholder = 'Password', ...props }, ref) => {
  const [show, setShow] = useState(false);

  return (
    <div className='relative'>
      <input
        ref={ref}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        className='w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text
                   placeholder:text-text-placeholder focus:border-primary focus:outline-none
                   focus:ring-1 focus:ring-primary transition-colors'
        {...props}
      />
      <button
        type='button'
        onClick={() => setShow((s) => !s)}
        className='absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text'
        tabIndex={-1}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
});

PasswordField.displayName = 'PasswordField';
export default PasswordField;
