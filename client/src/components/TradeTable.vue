<script setup>
import { formatCurrency, formatDateTime, formatNumber } from '../lib/formatters.js'

defineProps({
  trades: {
    type: Array,
    default: () => [],
  },
  showActions: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['delete'])
</script>

<template>
  <div class="table-card">
    <table class="trade-table">
      <thead>
        <tr>
          <th>Trade</th>
          <th>Setup</th>
          <th>Entrée</th>
          <th>Stop</th>
          <th>Target</th>
          <th>Résultat</th>
          <th>Ouverture</th>
          <th v-if="showActions">Actions</th>
        </tr>
      </thead>

      <tbody v-if="trades.length > 0">
        <tr v-for="trade in trades" :key="trade.id">
          <td>
            <div class="table-main">
              <strong>{{ trade.symbol }}</strong>
              <span>{{ trade.side }} · {{ trade.status }}</span>
            </div>
          </td>
          <td>
            <div class="table-main">
              <strong>{{ trade.strategy }}</strong>
              <span>{{ trade.timeframe }} · {{ trade.session }}</span>
            </div>
          </td>
          <td>{{ formatNumber(trade.entryPrice) }}</td>
          <td>{{ formatNumber(trade.stopLoss) }}</td>
          <td>{{ formatNumber(trade.takeProfit) }}</td>
          <td>
            <div class="table-main">
              <strong>{{ trade.analytics.pnlAmount === null ? '—' : formatCurrency(trade.analytics.pnlAmount) }}</strong>
              <span>
                {{ trade.analytics.rMultiple === null ? 'Trade ouvert' : `${formatNumber(trade.analytics.rMultiple)}R` }}
              </span>
            </div>
          </td>
          <td>{{ formatDateTime(trade.openedAt) }}</td>
          <td v-if="showActions">
            <div class="table-actions">
              <RouterLink class="button button--small button--ghost" :to="`/app/trades/${trade.id}/edit`">
                Modifier
              </RouterLink>
              <button class="button button--small button--danger" type="button" @click="$emit('delete', trade)">
                Supprimer
              </button>
            </div>
          </td>
        </tr>
      </tbody>

      <tbody v-else>
        <tr>
          <td class="table-empty" :colspan="showActions ? 8 : 7">
            Aucun trade pour le moment.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
