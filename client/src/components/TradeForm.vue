<script setup>
import { computed, reactive, ref, watch } from 'vue'

import {
  marketOptions,
  sessionOptions,
  sideOptions,
  statusOptions,
  strategyOptions,
  timeframeOptions,
} from '../lib/trade-options.js'
import { toDatetimeLocalValue } from '../lib/formatters.js'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  submitLabel: {
    type: String,
    default: 'Enregistrer',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])
const screenshotInput = ref(null)
const screenshotError = ref('')

const form = reactive({
  symbol: '',
  market: marketOptions[0],
  side: sideOptions[0].value,
  status: statusOptions[0].value,
  strategy: strategyOptions[0],
  timeframe: timeframeOptions[1],
  session: sessionOptions[2],
  entryPrice: '',
  stopLoss: '',
  takeProfit: '',
  exitPrice: '',
  quantity: '',
  riskAmount: '',
  realizedPnl: '',
  fees: '0',
  conviction: '',
  tags: '',
  screenshotUrl: '',
  setupNotes: '',
  reviewNotes: '',
  openedAt: '',
  closedAt: '',
})

watch(() => props.modelValue, (value) => {
  form.symbol = value.symbol || ''
  form.market = value.market || marketOptions[0]
  form.side = value.side || sideOptions[0].value
  form.status = value.status || statusOptions[0].value
  form.strategy = value.strategy || strategyOptions[0]
  form.timeframe = value.timeframe || timeframeOptions[1]
  form.session = value.session || sessionOptions[2]
  form.entryPrice = value.entryPrice ?? ''
  form.stopLoss = value.stopLoss ?? ''
  form.takeProfit = value.takeProfit ?? ''
  form.exitPrice = value.exitPrice ?? ''
  form.quantity = value.quantity ?? ''
  form.riskAmount = value.riskAmount ?? ''
  form.realizedPnl = value.realizedPnl ?? ''
  form.fees = value.fees ?? '0'
  form.conviction = value.conviction ?? ''
  form.tags = Array.isArray(value.tags) ? value.tags.join(', ') : ''
  form.screenshotUrl = value.screenshotUrl || ''
  form.setupNotes = value.setupNotes || ''
  form.reviewNotes = value.reviewNotes || ''
  form.openedAt = toDatetimeLocalValue(value.openedAt) || toDatetimeLocalValue(new Date().toISOString())
  form.closedAt = toDatetimeLocalValue(value.closedAt)
}, {
  immediate: true,
})

const canShowReviewNotes = computed(() => ['closed', 'cancelled'].includes(form.status))
const screenshotPreview = computed(() => form.screenshotUrl || '')

function normalizeOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  return Number(value)
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Lecture impossible'))
    reader.readAsDataURL(file)
  })
}

async function handleScreenshotChange(event) {
  screenshotError.value = ''
  const file = event.target.files?.[0]

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    screenshotError.value = 'Choisis une image.'
    event.target.value = ''
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    screenshotError.value = 'Image trop lourde. Maximum 2 Mo.'
    event.target.value = ''
    return
  }

  try {
    form.screenshotUrl = await readFileAsDataUrl(file)
  } catch {
    screenshotError.value = 'Impossible de charger l’image.'
  }
}

function clearScreenshot() {
  form.screenshotUrl = ''
  screenshotError.value = ''
  if (screenshotInput.value) {
    screenshotInput.value.value = ''
  }
}

function handleSubmit() {
  emit('submit', {
    symbol: form.symbol,
    market: form.market,
    side: form.side,
    status: form.status,
    strategy: form.strategy,
    timeframe: form.timeframe,
    session: form.session,
    entryPrice: normalizeOptionalNumber(form.entryPrice),
    stopLoss: normalizeOptionalNumber(form.stopLoss),
    takeProfit: normalizeOptionalNumber(form.takeProfit),
    exitPrice: normalizeOptionalNumber(form.exitPrice),
    quantity: normalizeOptionalNumber(form.quantity),
    riskAmount: normalizeOptionalNumber(form.riskAmount),
    realizedPnl: normalizeOptionalNumber(form.realizedPnl),
    fees: normalizeOptionalNumber(form.fees),
    conviction: normalizeOptionalNumber(form.conviction),
    tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    screenshotUrl: form.screenshotUrl,
    setupNotes: form.setupNotes,
    reviewNotes: form.reviewNotes,
    openedAt: form.openedAt ? new Date(form.openedAt).toISOString() : null,
    closedAt: form.closedAt ? new Date(form.closedAt).toISOString() : null,
  })
}
</script>

<template>
  <form class="trade-form" @submit.prevent="handleSubmit">
    <div class="form-grid">
      <label class="form-field">
        <span>Asset</span>
        <input v-model="form.symbol" type="text" placeholder="NQ1!, EURUSD, TSLA">
      </label>

      <label class="form-field">
        <span>Marché</span>
        <select v-model="form.market">
          <option v-for="market in marketOptions" :key="market" :value="market">{{ market }}</option>
        </select>
      </label>

      <label class="form-field">
        <span>Side</span>
        <select v-model="form.side">
          <option v-for="option in sideOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>

      <label class="form-field">
        <span>Statut</span>
        <select v-model="form.status">
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>

      <label class="form-field">
        <span>Stratégie</span>
        <select v-model="form.strategy">
          <option v-for="strategy in strategyOptions" :key="strategy" :value="strategy">{{ strategy }}</option>
        </select>
      </label>

      <label class="form-field">
        <span>Timeframe</span>
        <select v-model="form.timeframe">
          <option v-for="timeframe in timeframeOptions" :key="timeframe" :value="timeframe">{{ timeframe }}</option>
        </select>
      </label>

      <label class="form-field">
        <span>Session</span>
        <select v-model="form.session">
          <option v-for="session in sessionOptions" :key="session" :value="session">{{ session }}</option>
        </select>
      </label>

      <label class="form-field">
        <span>Quantité</span>
        <input v-model="form.quantity" type="number" min="0" step="0.01">
      </label>

      <label class="form-field">
        <span>Entrée</span>
        <input v-model="form.entryPrice" type="number" step="0.01">
      </label>

      <label class="form-field">
        <span>Stop loss</span>
        <input v-model="form.stopLoss" type="number" step="0.01">
      </label>

      <label class="form-field">
        <span>Take profit</span>
        <input v-model="form.takeProfit" type="number" step="0.01">
      </label>

      <label class="form-field">
        <span>Prix de sortie</span>
        <input v-model="form.exitPrice" type="number" step="0.01">
      </label>

      <label class="form-field">
        <span>Risque ($)</span>
        <input v-model="form.riskAmount" type="number" min="0" step="0.01">
      </label>

      <label class="form-field">
        <span>PnL réalisé ($)</span>
        <input v-model="form.realizedPnl" type="number" step="0.01">
      </label>

      <label class="form-field">
        <span>Frais ($)</span>
        <input v-model="form.fees" type="number" min="0" step="0.01">
      </label>

      <label class="form-field">
        <span>Conviction</span>
        <input v-model="form.conviction" type="number" min="1" max="5" step="1">
      </label>

      <label class="form-field">
        <span>Ouverture</span>
        <input v-model="form.openedAt" type="datetime-local">
      </label>

      <label class="form-field">
        <span>Clôture</span>
        <input v-model="form.closedAt" type="datetime-local">
      </label>

      <label class="form-field form-field--wide">
        <span>Tags</span>
        <input v-model="form.tags" type="text" placeholder="breakout, A+, NY open">
      </label>

      <div class="form-field form-field--wide">
        <span>Capture du setup</span>
        <input
          ref="screenshotInput"
          type="file"
          accept="image/*"
          @change="handleScreenshotChange"
        >
        <small v-if="screenshotError" class="field-error">{{ screenshotError }}</small>
        <div v-if="screenshotPreview" class="screenshot-preview">
          <img :src="screenshotPreview" alt="Capture du setup">
          <button class="button button--small button--ghost" type="button" @click="clearScreenshot">
            Supprimer l'image
          </button>
        </div>
      </div>

      <label class="form-field form-field--wide">
        <span>Notes de setup</span>
        <textarea v-model="form.setupNotes" rows="5" placeholder="Pourquoi j'ai pris ce trade, plan, contexte..." />
      </label>

      <label v-if="canShowReviewNotes" class="form-field form-field--wide">
        <span>Notes après le trade</span>
        <textarea v-model="form.reviewNotes" rows="5" placeholder="Ce qui s'est bien passé, erreur, chose à retenir..." />
      </label>
    </div>

    <div class="form-footer">
      <button class="button" type="submit" :disabled="loading">
        {{ loading ? 'Enregistrement...' : submitLabel }}
      </button>
    </div>
  </form>
</template>
