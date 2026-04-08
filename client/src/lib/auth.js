import { request } from './api.js'

function fetchCurrentUser() {
  return request('/users/me')
}

function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: payload,
  })
}

function register(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: payload,
  })
}

function logout() {
  return request('/auth/logout', {
    method: 'POST',
  })
}

function verifyEmail(token) {
  return request('/users/verify-email', {
    query: { token },
  })
}

function resendVerificationEmail(email) {
  return request('/auth/resend-verification-email', {
    method: 'POST',
    body: { email },
  })
}

function deleteAccount(userId) {
  return request(`/users/${userId}`, {
    method: 'DELETE',
  })
}

export {
  deleteAccount,
  fetchCurrentUser,
  login,
  logout,
  register,
  resendVerificationEmail,
  verifyEmail,
}
