<script setup>
import { onMounted, reactive, ref, watch } from 'vue'

import TradeTable from '../components/TradeTable.vue'
import { ApiError } from '../lib/api.js'
import { deleteTrade, fetchTrades } from '../lib/trades.js'

const loading = ref(true)
const errorMessage = ref('')
const trades = ref([])
const pagination = ref(null)

const filters = reactive({
  search: '',
  status: '',
  side: '',
})

async function loadTrades() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchTrades({
      search: filters.search,
      status: filters.status,
      side: filters.side,
      limit: 50,
    })
    trades.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : 'Impossible de charger les trades'
  } finally {
    loading.value = false
  }
}

async function handleDelete(trade) {
  const confirmed = window.confirm(`Supprimer définitivement le trade ${trade.symbol} ?`)

  if (!confirmed) {
    return
  }

  await deleteTrade(trade.id)
  await loadTrades()
}

watch(() => [filters.search, filters.status, filters.side], () => {
  loadTrades()
})

onMounted(loadTrades)
</script>

<template>
  <section class="page-section">
    <div class="page-heading">
      <div>
        <p class="page-kicker">Liste</p>
        <h2>Tous les trades</h2>
        <p>Tu peux chercher un trade par actif, stratégie ou session.</p>
      </div>

      <RouterLink class="button" to="/app/trades/new">
        Ajouter un trade
      </RouterLink>
    </div>

    <div class="filters-card">
      <label class="form-field">
        <span>Recherche</span>
        <input v-model="filters.search" type="text" placeholder="Actif, stratégie, session...">
      </label>

      <label class="form-field">
        <span>Statut</span>
        <select v-model="filters.status">
          <option value="">Tous</option>
          <option value="planned">Planifié</option>
          <option value="open">Ouvert</option>
          <option value="closed">Clos</option>
          <option value="cancelled">Annulé</option>
        </select>
      </label>

      <label class="form-field">
        <span>Side</span>
        <select v-model="filters.side">
          <option value="">Tous</option>
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
      </label>
    </div>

    <p v-if="errorMessage" class="alert alert--error">{{ errorMessage }}</p>
    <div v-if="loading" class="panel-empty">Chargement des trades...</div>
    <TradeTable v-else :trades="trades" @delete="handleDelete" />

    <p v-if="pagination" class="pagination-text">
      {{ pagination.total }} trade(s) · page {{ pagination.page }} / {{ pagination.totalPages }}
    </p>
  </section>
</template>
