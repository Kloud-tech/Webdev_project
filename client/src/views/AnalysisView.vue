<script setup>
import { computed, onMounted, ref } from 'vue'

import MetricCard from '../components/MetricCard.vue'
import { ApiError } from '../lib/api.js'
import { formatCurrency, formatNumber, formatPercent } from '../lib/formatters.js'
import { fetchTradeAnalysis } from '../lib/trades.js'

const loading = ref(true)
const errorMessage = ref('')
const analysis = ref(null)

const metrics = computed(() => {
  if (!analysis.value) {
    return []
  }

  return [
    {
      label: 'Trades clôturés',
      value: formatNumber(analysis.value.summary.closedTrades, { maximumFractionDigits: 0 }),
      hint: `${analysis.value.summary.totalTrades} trade(s) au total`,
    },
    {
      label: 'Win rate',
      value: formatPercent(analysis.value.summary.winRate),
      hint: `${formatNumber(analysis.value.summary.openTrades, { maximumFractionDigits: 0 })} ouvert(s) · ${formatNumber(analysis.value.summary.plannedTrades, { maximumFractionDigits: 0 })} planifié(s)`,
    },
    {
      label: 'PnL moyen',
      value: analysis.value.summary.averagePnl === null ? '—' : formatCurrency(analysis.value.summary.averagePnl),
      hint: analysis.value.summary.netPnl === null ? 'Pas assez de trades clos' : `Net total ${formatCurrency(analysis.value.summary.netPnl)}`,
    },
    {
      label: 'Profit factor',
      value: analysis.value.summary.profitFactor === null ? '—' : formatNumber(analysis.value.summary.profitFactor),
      hint: `Frais cumulés ${formatCurrency(analysis.value.summary.totalFees)}`,
    },
  ]
})

const topSessions = computed(() => analysis.value?.breakdowns.bySession.slice(0, 4) || [])
const topStrategies = computed(() => analysis.value?.breakdowns.byStrategy.slice(0, 4) || [])
const sideBreakdown = computed(() => analysis.value?.breakdowns.bySide || [])

async function loadAnalysis() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchTradeAnalysis()
    analysis.value = response.analysis
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : 'Impossible de charger l’analyse'
  } finally {
    loading.value = false
  }
}

onMounted(loadAnalysis)
</script>

<template>
  <section class="page-section">
    <div class="page-heading">
      <div>
        <p class="page-kicker">Analyse</p>
        <h2>Ce que ton journal raconte</h2>
        <p>Quelques stats simples pour voir ce qui marche, ce qui te coûte, et ce que tu peux améliorer.</p>
      </div>
    </div>

    <p v-if="errorMessage" class="alert alert--error">{{ errorMessage }}</p>
    <div v-if="loading" class="panel-empty">Chargement de l’analyse...</div>

    <template v-else-if="analysis">
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
              <p class="page-kicker">À retenir</p>
              <h3>Points à améliorer</h3>
            </div>
          </div>

          <div class="analysis-list">
            <p
              v-for="insight in analysis.insights"
              :key="insight"
              class="analysis-item"
            >
              {{ insight }}
            </p>
          </div>
        </article>

        <article class="panel-card">
          <div class="panel-card__header">
            <div>
              <p class="page-kicker">Ce qui ressort</p>
              <h3>Meilleurs repères</h3>
            </div>
          </div>

          <div class="stack-md">
            <div class="trade-highlight">
              <span>Meilleure session</span>
              <strong>{{ analysis.highlights.bestSession?.label || 'Pas assez de données' }}</strong>
            </div>
            <div class="trade-highlight">
              <span>Meilleure stratégie</span>
              <strong>{{ analysis.highlights.bestStrategy?.label || 'Pas assez de données' }}</strong>
            </div>
            <div class="trade-highlight">
              <span>Side le plus rentable</span>
              <strong>{{ analysis.highlights.bestSide?.label || 'Pas assez de données' }}</strong>
            </div>
            <div class="trade-highlight">
              <span>Durée moyenne d’un trade clos</span>
              <strong>{{ analysis.summary.averageHoldHours === null ? '—' : `${formatNumber(analysis.summary.averageHoldHours)} h` }}</strong>
            </div>
          </div>
        </article>
      </div>

      <div class="dashboard-grid">
        <article class="panel-card">
          <div class="panel-card__header">
            <div>
              <p class="page-kicker">Sessions</p>
              <h3>Ce qui marche selon le moment</h3>
            </div>
          </div>

          <div class="analysis-table">
            <div v-for="item in topSessions" :key="item.label" class="analysis-row">
              <div>
                <strong>{{ item.label }}</strong>
                <span>{{ item.count }} trade(s)</span>
              </div>
              <div>
                <strong>{{ item.netPnl === null ? '—' : formatCurrency(item.netPnl) }}</strong>
                <span>{{ item.winRate === null ? '—' : `Win rate ${formatPercent(item.winRate)}` }}</span>
              </div>
            </div>
          </div>
        </article>

        <article class="panel-card">
          <div class="panel-card__header">
            <div>
              <p class="page-kicker">Stratégies</p>
              <h3>Celles qui ressortent</h3>
            </div>
          </div>

          <div class="analysis-table">
            <div v-for="item in topStrategies" :key="item.label" class="analysis-row">
              <div>
                <strong>{{ item.label }}</strong>
                <span>{{ item.count }} trade(s)</span>
              </div>
              <div>
                <strong>{{ item.netPnl === null ? '—' : formatCurrency(item.netPnl) }}</strong>
                <span>{{ item.winRate === null ? '—' : `Win rate ${formatPercent(item.winRate)}` }}</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <article class="panel-card">
        <div class="panel-card__header">
          <div>
            <p class="page-kicker">Long / Short</p>
            <h3>Répartition par side</h3>
          </div>
        </div>

        <div class="state-grid">
          <div v-for="item in sideBreakdown" :key="item.label" class="state-pill state-pill--stacked">
            <span>{{ item.label }}</span>
            <strong>{{ item.netPnl === null ? '—' : formatCurrency(item.netPnl) }}</strong>
            <small>{{ item.winRate === null ? `${item.count} trade(s)` : `${item.count} trade(s) · ${formatPercent(item.winRate)}` }}</small>
          </div>
        </div>
      </article>
    </template>
  </section>
</template>
