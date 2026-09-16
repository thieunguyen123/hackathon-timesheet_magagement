import client from './client'

export const stats = () => client.get('/dashboard/stats').then((res) => res.data)
