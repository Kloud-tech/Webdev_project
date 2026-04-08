<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AuthShell from '../components/AuthShell.vue'
import { ApiError } from '../lib/api.js'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''

  try {
    await authStore.loginUser(form)
    await router.push(route.query.redirect?.toString() || '/app/dashboard')
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : 'Connexion impossible'
  }
}
</script>

<template>
  <AuthShell
    title="Connexion"
    subtitle="Connecte-toi pour voir tes trades enregistrés."
  >
    <form class="stack-md" @submit.prevent="handleSubmit">
      <label class="form-field">
        <span>Email</span>
        <input v-model="form.email" type="email" autocomplete="email" required>
      </label>

      <label class="form-field">
        <span>Mot de passe</span>
        <input v-model="form.password" type="password" autocomplete="current-password" required>
      </label>

      <p v-if="errorMessage" class="alert alert--error">{{ errorMessage }}</p>

      <button class="button" type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Connexion...' : 'Se connecter' }}
      </button>

      <p class="auth-links">
        Pas encore de compte ?
        <RouterLink to="/register">Créer un compte</RouterLink>
      </p>
    </form>
  </AuthShell>
</template>
