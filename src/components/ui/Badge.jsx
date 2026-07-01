import { STATUS_META } from '../../utils/constants';

const Badge = ({ status }) => {
  const meta = STATUS_META[status];
  if (!meta) return <span className='badge-pending'>{status}</span>;
  return <span className={meta.badge}>{meta.label}</span>;
};

export default Badge;
