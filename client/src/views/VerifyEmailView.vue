<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AuthShell from '../components/AuthShell.vue'
import { ApiError } from '../lib/api.js'
import { useAuthStore } from '../stores/auth.js'

const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const status = ref('idle')
const message = ref('')

onMounted(async () => {
  const token = route.query.token?.toString()

  if (!token) {
    status.value = 'error'
    message.value = 'Token de validation manquant.'
    loading.value = false
    return
  }

  try {
    const response = await authStore.verifyEmailToken(token)
    status.value = 'success'
    message.value = response.message
  } catch (error) {
    status.value = 'error'
    message.value = error instanceof ApiError ? error.message : 'Validation impossible'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AuthShell
    title="Validation d’email"
    subtitle="Le compte doit être confirmé avant la première connexion."
  >
    <div class="stack-md">
      <p v-if="loading">Validation en cours...</p>
      <p v-else :class="['alert', status === 'success' ? 'alert--success' : 'alert--error']">
        {{ message }}
      </p>

      <RouterLink class="button" to="/login">Aller à la connexion</RouterLink>
    </div>
  </AuthShell>
</template>
