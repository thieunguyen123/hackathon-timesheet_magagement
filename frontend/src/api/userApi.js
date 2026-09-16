import client from './client'

export const list = (params = {}) => client.get('/admin/users', { params }).then((res) => res.data)

export const create = (payload) => client.post('/admin/users', payload).then((res) => res.data)

export const update = (id, payload) =>
  client.put(`/admin/users/${id}`, payload).then((res) => res.data)

export const remove = (id) => client.delete(`/admin/users/${id}`).then((res) => res.data)

export const team = () => client.get('/team/users').then((res) => res.data)
