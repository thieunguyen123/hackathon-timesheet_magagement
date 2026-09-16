import client from './client'

export const timesheet = (month) =>
  client
    .get('/admin/export/timesheet', { params: { month }, responseType: 'blob' })
    .then((res) => res.data)

export const requests = (month) =>
  client
    .get('/admin/export/requests', { params: { month }, responseType: 'blob' })
    .then((res) => res.data)
