import client from './client'

export const list = () => client.get('/notifications').then((res) => res.data)

export const unreadCount = () =>
  client.get('/notifications/unread-count').then((res) => res.data)

export const markRead = (id) => client.post(`/notifications/${id}/read`).then((res) => res.data)

export const markAllRead = () => client.post('/notifications/read-all').then((res) => res.data)
