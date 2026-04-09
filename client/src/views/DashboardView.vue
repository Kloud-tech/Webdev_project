<script setup>
import { computed, onMounted, ref } from 'vue'

import MetricCard from '../components/MetricCard.vue'
import TradeTable from '../components/TradeTable.vue'
import { ApiError } from '../lib/api.js'
import { deleteTrade, fetchTradeOverview } from '../lib/trades.js'
import { formatCurrency, formatNumber, formatPercent } from '../lib/formatters.js'

const loading = ref(true)
const errorMessage = ref('')
const overview = ref(null)
const recentTrades = ref([])
const selectedCurrency = ref('USD')

const exchangeRate = 1.17

function convertAmount(value) {
  if (selectedCurrency.value === 'EUR') {
    return (value ?? 0) / exchangeRate
  }

  return value ?? 0
}

function formatDashboardCurrency(value) {
  return formatCurrency(convertAmount(value), selectedCurrency.value)
}

const metrics = computed(() => {
  if (!overview.value) {
    return []
  }

  return [
    {
      label: 'Trades enregistrés',
      value: formatNumber(overview.value.totalTrades, { maximumFractionDigits: 0 }),
      hint: `${overview.value.openTrades} ouverts · ${overview.value.plannedTrades} planifiés`,
    },
    {
      label: 'Trades clôturés',
      value: formatNumber(overview.value.closedTrades, { maximumFractionDigits: 0 }),
      hint: `Win rate ${formatPercent(overview.value.winRate)}`,
    },
    {
      label: 'PnL net',
      value: formatDashboardCurrency(overview.value.netPnl),
      hint: `R moyen ${formatNumber(overview.value.averageR)}R · Taux fixe 1 € = ${exchangeRate} $`,
    },
  ]
})

async function loadOverview() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchTradeOverview()
    overview.value = response.overview
    recentTrades.value = response.recentTrades
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : 'Impossible de charger le dashboard'
  } finally {
    loading.value = false
  }
}

async function handleDelete(trade) {
  const confirmed = window.confirm(`Supprimer le trade ${trade.symbol} ouvert le ${new Date(trade.openedAt).toLocaleString('fr-FR')} ?`)

  if (!confirmed) {
    return
  }

  await deleteTrade(trade.id)
  await loadOverview()
}

onMounted(loadOverview)
</script>

<template>
  <section class="page-section">
    <div class="page-heading">
      <div>
        <p class="page-kicker">Résumé</p>
        <h2>Tableau de bord</h2>
        <p>Vue rapide sur les trades enregistrés et les résultats.</p>
      </div>

      <label class="currency-switcher">
        <span>Devise</span>
        <select v-model="selectedCurrency">
          <option value="USD">Dollar ($)</option>
          <option value="EUR">Euro (€)</option>
        </select>
      </label>
    </div>

    <p v-if="errorMessage" class="alert alert--error">{{ errorMessage }}</p>

    <div v-if="loading" class="panel-empty">Chargement du dashboard...</div>

    <template v-else>
      <div class="metrics-grid">
        <MetricCard
          v-for="metric in metrics"
          :key="metric.label"
          :label="metric.label"
          :value="metric.value"
          :hint="metric.hint"
        />
      </div>

      <div class="dashboard-grid">
        <article class="panel-card">
          <div class="panel-card__header">
            <div>
              <p class="page-kicker">Meilleur / pire</p>
              <h3>Repères</h3>
            </div>
          </div>

          <div class="stack-md">
            <div class="trade-highlight">
              <span>Meilleur trade</span>
              <strong>{{ overview?.bestTrade ? `${overview.bestTrade.symbol} · ${formatDashboardCurrency(overview.bestTrade.analytics.pnlAmount)}` : 'Aucun trade gagnant' }}</strong>
            </div>
            <div class="trade-highlight">
              <span>Pire trade</span>
              <strong>{{ overview?.worstTrade ? `${overview.worstTrade.symbol} · ${formatDashboardCurrency(overview.worstTrade.analytics.pnlAmount)}` : 'Aucun trade perdant' }}</strong>
            </div>
          </div>
        </article>

        <article class="panel-card">
          <div class="panel-card__header">
            <div>
              <p class="page-kicker">Statuts</p>
              <h3>Répartition des états</h3>
            </div>
          </div>

          <div class="state-grid">
            <div class="state-pill">
              <span>Ouverts</span>
              <strong>{{ overview?.openTrades ?? 0 }}</strong>
            </div>
            <div class="state-pill">
              <span>Planifiés</span>
              <strong>{{ overview?.plannedTrades ?? 0 }}</strong>
            </div>
            <div class="state-pill">
              <span>Clôturés</span>
              <strong>{{ overview?.closedTrades ?? 0 }}</strong>
            </div>
          </div>
        </article>
      </div>

      <div class="page-heading page-heading--tight">
        <div>
          <p class="page-kicker">Historique récent</p>
          <h3>Derniers trades</h3>
        </div>
      </div>

      <TradeTable :trades="recentTrades" @delete="handleDelete" />
    </template>
  </section>
</template>
