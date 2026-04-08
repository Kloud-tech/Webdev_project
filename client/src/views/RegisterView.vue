<script setup>
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

import AuthShell from '../components/AuthShell.vue'
import { ApiError } from '../lib/api.js'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore()

const form = reactive({
  username: '',
  email: '',
  password: '',
})

const successMessage = ref('')
const verificationUrl = ref('')
const errorMessage = ref('')

async function handleSubmit() {
  successMessage.value = ''
  verificationUrl.value = ''
  errorMessage.value = ''

  try {
    const response = await authStore.registerUser(form)
    successMessage.value = response.message
    verificationUrl.value = response.verificationUrl || ''
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : 'Inscription impossible'
  }
}
</script>

<template>
  <AuthShell
    title="Créer un compte"
    subtitle="Crée un compte pour commencer à enregistrer tes trades."
  >
    <form class="stack-md" @submit.prevent="handleSubmit">
      <label class="form-field">
        <span>Username</span>
        <input v-model="form.username" type="text" autocomplete="username" required>
      </label>

      <label class="form-field">
        <span>Email</span>
        <input v-model="form.email" type="email" autocomplete="email" required>
      </label>

      <label class="form-field">
        <span>Mot de passe</span>
        <input v-model="form.password" type="password" autocomplete="new-password" required>
      </label>

      <p v-if="errorMessage" class="alert alert--error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="alert alert--success">{{ successMessage }}</p>

      <a v-if="verificationUrl" class="button button--ghost" :href="verificationUrl">
        Valider l’email
      </a>

      <button class="button" type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Création...' : 'Créer le compte' }}
      </button>

      <p class="auth-links">
        Déjà inscrit ?
        <RouterLink to="/login">Se connecter</RouterLink>
      </p>
    </form>
  </AuthShell>
</template>
