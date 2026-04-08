import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  deleteAccount,
  fetchCurrentUser,
  login,
  logout,
  register,
  resendVerificationEmail,
  verifyEmail,
} from '../lib/auth.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const initialized = ref(false)
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(user.value))

  async function restoreSession() {
    if (initialized.value) {
      return user.value
    }

    loading.value = true

    try {
      const response = await fetchCurrentUser()
      user.value = response.user
    } catch {
      user.value = null
    } finally {
      initialized.value = true
      loading.value = false
    }

    return user.value
  }

  async function loginUser(payload) {
    loading.value = true

    try {
      await login(payload)
      const response = await fetchCurrentUser()
      user.value = response.user
      initialized.value = true
      return response
    } finally {
      loading.value = false
    }
  }

  async function registerUser(payload) {
    loading.value = true

    try {
      return await register(payload)
    } finally {
      loading.value = false
    }
  }

  async function logoutUser() {
    try {
      await logout()
    } finally {
      user.value = null
      initialized.value = true
    }
  }

  async function verifyEmailToken(token) {
    return verifyEmail(token)
  }

  async function resendVerification(email) {
    return resendVerificationEmail(email)
  }

  async function deleteCurrentAccount() {
    if (!user.value) {
      return
    }

    await deleteAccount(user.value._id || user.value.id)
    user.value = null
    initialized.value = true
  }

  return {
    deleteCurrentAccount,
    initialized,
    isAuthenticated,
    loading,
    loginUser,
    logoutUser,
    registerUser,
    resendVerification,
    restoreSession,
    user,
    verifyEmailToken,
  }
})
