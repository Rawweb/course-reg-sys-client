import { X } from 'lucide-react';

const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmColor = 'primary', // "primary" | "danger"
  onConfirm,
  onCancel,
  loading = false,
  // Optional note field (used for rejection feedback):
  showNote = false,
  noteValue = '',
  onNoteChange,
  notePlaceholder = '',
}) => {
  // If not open, render nothing at all.
  if (!open) return null;

  const confirmClasses =
    confirmColor === 'danger' ? 'bg-danger hover:bg-red-700' : 'bg-primary hover:bg-primary-hover';

  return (
    // The backdrop: covers the screen, dims the page. Clicking it cancels.
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      onClick={onCancel}
    >
      {/* The dialog. stopPropagation so clicking INSIDE doesn't close it. */}
      <div
        className='w-full max-w-md rounded-xl bg-surface p-6 shadow-modal'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='mb-3 flex items-start justify-between'>
          <h3 className='text-lg font-semibold text-text-heading'>{title}</h3>
          <button onClick={onCancel} className='text-text-muted hover:text-text'>
            <X size={20} />
          </button>
        </div>

        <p className='text-sm text-text'>{message}</p>

        {/* Optional note textarea (for rejection feedback) */}
        {showNote && (
          <textarea
            value={noteValue}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder={notePlaceholder}
            rows={3}
            className='mt-4 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm
                       text-text placeholder:text-text-placeholder focus:border-primary
                       focus:outline-none focus:ring-1 focus:ring-primary'
          />
        )}

        <div className='mt-5 flex justify-end gap-2'>
          <button
            onClick={onCancel}
            disabled={loading}
            className='rounded-lg border border-border bg-surface px-4 py-2 text-sm
                       font-medium text-text hover:bg-slate-50 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors
                        disabled:opacity-60 ${confirmClasses}`}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
