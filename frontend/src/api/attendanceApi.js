import client from './client'

export const list = (params = {}) => client.get('/attendances', { params }).then((res) => res.data)

export const sync = () => client.post('/attendances/sync').then((res) => res.data)
