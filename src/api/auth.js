import axios from 'axios'

export const login = (username, password) =>
  axios.post('/api/auth/login/', { username, password })

export const register = (data) =>
  axios.post('/api/auth/register/', data)
