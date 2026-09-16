export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  ATTENDANCE: '/attendance',
  REQUESTS: '/requests',
  APPROVALS: '/approvals',
  ADMIN_USERS: '/admin/users',
  ADMIN_REPORTS: '/admin/reports',
}

export const REQUEST_TYPES = [
  { value: 'off', label: 'Nghỉ phép' },
  { value: 'remote', label: 'Làm remote' },
  { value: 'ot', label: 'Làm thêm giờ (OT)' },
]

export const REQUEST_STATUSES = [
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
]

export const ROLES = {
  admin: { value: 'admin', label: 'Quản trị viên' },
  manager: { value: 'manager', label: 'Quản lý' },
  user: { value: 'user', label: 'Nhân viên' },
}

export const REQUEST_TYPE_LABELS = {
  off: 'Nghỉ phép',
  remote: 'Làm remote',
  ot: 'Làm thêm giờ (OT)',
}

export const STATUS_LABELS = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
}

export const WORK = {
  START: '08:30',
  END: '17:30',
  STANDARD_HOURS: 8,
}

export const GENDERS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
]

export const GENDER_LABELS = { male: 'Nam', female: 'Nữ' }
