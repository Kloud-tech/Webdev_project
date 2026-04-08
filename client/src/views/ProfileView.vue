<script setup>
import { ref } from 'vue'

import { ApiError } from '../lib/api.js'
import { formatDateTime } from '../lib/formatters.js'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore()
const infoMessage = ref('')
const errorMessage = ref('')
const resending = ref(false)

async function handleResendEmail() {
  if (!authStore.user?.email) {
    return
  }

  resending.value = true
  infoMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await authStore.resendVerification(authStore.user.email)
    infoMessage.value = response.message
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : 'Impossible de renvoyer le mail'
  } finally {
    resending.value = false
  }
}

</script>

<template>
  <section class="page-section">
    <div class="page-heading">
      <div>
        <p class="page-kicker">Compte utilisateur</p>
        <h2>Profil</h2>
        <p>Informations du compte utilisé sur le site.</p>
      </div>
    </div>

    <div class="profile-grid">
      <article class="panel-card">
        <div class="stack-md">
          <div class="profile-row">
            <span>Username</span>
            <strong>{{ authStore.user?.username }}</strong>
          </div>
          <div class="profile-row">
            <span>Email</span>
            <strong>{{ authStore.user?.email }}</strong>
          </div>
          <div class="profile-row">
            <span>Email vérifié</span>
            <strong>{{ authStore.user?.emailVerified ? 'Oui' : 'Non' }}</strong>
          </div>
          <div class="profile-row">
            <span>Créé le</span>
            <strong>{{ formatDateTime(authStore.user?.createdAt) }}</strong>
          </div>
        </div>
      </article>

      <article class="panel-card">
        <div class="stack-md">
          <p class="page-kicker">Actions</p>
          <p v-if="infoMessage" class="alert alert--success">{{ infoMessage }}</p>
          <p v-if="errorMessage" class="alert alert--error">{{ errorMessage }}</p>

          <button
            v-if="!authStore.user?.emailVerified"
            class="button button--ghost"
            type="button"
            :disabled="resending"
            @click="handleResendEmail"
          >
            {{ resending ? 'Envoi...' : 'Renvoyer l’email de validation' }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>
