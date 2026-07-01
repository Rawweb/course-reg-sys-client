export const STATUS_META = {
  pending: { label: 'Pending', badge: 'badge-pending' },
  approved: { label: 'Approved', badge: 'badge-approved' },
  rejected: { label: 'Rejected', badge: 'badge-rejected' },
};

export const CURRENT_SESSION = '2025/2026';

// Unit-load rules (mirror the backend validator).
export const UNIT_RULES = {
  MIN: 15,
  MAX_NORMAL: 24,
  MAX_CARRYOVER: 30,
  EXEMPT_LEVEL: 400
};