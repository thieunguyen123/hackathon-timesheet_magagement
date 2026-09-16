import client from './client'

export const login = (payload) => client.post('/auth/login', payload).then((res) => res.data)

export const logout = () => client.post('/auth/logout').then((res) => res.data)

export const me = () => client.get('/auth/me').then((res) => res.data)
