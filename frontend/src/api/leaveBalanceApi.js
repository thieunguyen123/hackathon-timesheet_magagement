import client from './client'

export const get = (params = {}) => client.get('/leave-balance', { params }).then((res) => res.data)
