// A generic confirmation modal — reusable anywhere we need a
// styled "are you sure?" prompt instead of the browser's default confirm()
const ConfirmModal = ({
  title,
  message,
  confirmLabel = 'Confirm',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50'>
      <div className='card max-w-sm w-full'>
        <h2 className='font-semibold text-text-heading mb-2'>{title}</h2>
        <p className='text-sm text-text-muted mb-5'>{message}</p>

        <div className='flex gap-3'>
          <button
            onClick={onCancel}
            className='w-auto px-5 py-2.5 rounded-lg text-sm font-medium text-text border border-border flex-1'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className='btn w-auto px-5 bg-danger hover:bg-red-700 flex-1'
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
