import client from './client'

export const list = (params) => client.get('/requests', { params }).then((res) => res.data)

export const create = (payload) => client.post('/requests', payload).then((res) => res.data)

export const approve = (id) => client.post(`/requests/${id}/approve`).then((res) => res.data)

export const reject = (id, reject_reason) =>
  client.post(`/requests/${id}/reject`, { reject_reason }).then((res) => res.data)
