<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import TradeForm from '../components/TradeForm.vue'
import { ApiError } from '../lib/api.js'
import { createTrade, fetchTrade, updateTrade } from '../lib/trades.js'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const initialLoading = ref(false)
const errorMessage = ref('')
const trade = ref({
  symbol: '',
  market: 'Futures',
  side: 'long',
  status: 'planned',
  strategy: 'Breakout',
  timeframe: '5m',
  session: 'New York Open',
  entryPrice: '',
  stopLoss: '',
  takeProfit: '',
  exitPrice: '',
  quantity: '',
  riskAmount: '',
  realizedPnl: '',
  fees: 0,
  conviction: '',
  tags: [],
  screenshotUrl: '',
  setupNotes: '',
  reviewNotes: '',
  openedAt: new Date().toISOString(),
  closedAt: '',
})

const isEdit = computed(() => Boolean(route.params.id))

const title = computed(() => isEdit.value ? 'Modifier le trade' : 'Nouveau trade')
const subtitle = computed(() => isEdit.value
  ? 'Modifie les informations du trade.'
  : 'Remplis les champs pour enregistrer un nouveau trade.')

async function loadTrade() {
  if (!isEdit.value) {
    return
  }

  initialLoading.value = true

  try {
    const response = await fetchTrade(route.params.id)
    trade.value = response.trade
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : 'Impossible de charger le trade'
  } finally {
    initialLoading.value = false
  }
}

async function handleSubmit(payload) {
  loading.value = true
  errorMessage.value = ''

  try {
    if (isEdit.value) {
      await updateTrade(route.params.id, payload)
    } else {
      await createTrade(payload)
    }

    await router.push('/app/trades')
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : 'Enregistrement impossible'
  } finally {
    loading.value = false
  }
}

onMounted(loadTrade)
</script>

<template>
  <section class="page-section">
    <div class="page-heading">
      <div>
        <p class="page-kicker">Formulaire</p>
        <h2>{{ title }}</h2>
        <p>{{ subtitle }}</p>
      </div>
    </div>

    <p v-if="errorMessage" class="alert alert--error">{{ errorMessage }}</p>
    <div v-if="initialLoading" class="panel-empty">Chargement du trade...</div>

    <div v-else class="panel-card">
      <TradeForm
        :loading="loading"
        :model-value="trade"
        :submit-label="isEdit ? 'Mettre à jour le trade' : 'Créer le trade'"
        @submit="handleSubmit"
      />
    </div>
  </section>
</template>
