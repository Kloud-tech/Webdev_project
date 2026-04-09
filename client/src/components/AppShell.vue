<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import { useAuthStore } from '../stores/auth.js'

const route = useRoute()
const authStore = useAuthStore()

const navigation = [
  { label: 'Dashboard', to: '/app/dashboard' },
  { label: 'Trades', to: '/app/trades' },
  { label: 'Nouveau trade', to: '/app/trades/new' },
  { label: 'Analyse', to: '/app/analysis' },
  { label: 'Profil', to: '/app/profile' },
]

const currentLabel = computed(() => route.meta.title || 'Trading Journal')

async function handleLogout() {
  try {
    await authStore.logoutUser()
  } finally {
    window.location.assign('/')
  }
}
</script>

<template>
  <div class="app-shell">
    <header class="shell-header">
      <div>
        <p class="shell-kicker">Trading Journal</p>
        <h1 class="shell-title">{{ currentLabel }}</h1>
      </div>

      <div class="shell-actions">
        <div class="shell-user">
          <span class="shell-user-name">{{ authStore.user?.username }}</span>
          <span class="shell-user-email">{{ authStore.user?.email }}</span>
        </div>
        <button class="button button--ghost" type="button" @click="handleLogout">
          Se déconnecter
        </button>
      </div>
    </header>

    <div class="shell-body">
      <aside class="shell-sidebar">
        <RouterLink class="brand-link" to="/app/dashboard">
          <span class="brand-mark">TJ</span>
          <span>Journal</span>
        </RouterLink>

        <nav class="shell-nav">
          <RouterLink
            v-for="item in navigation"
            :key="item.to"
            class="shell-nav-link"
            :to="item.to"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>

      <main class="shell-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>
