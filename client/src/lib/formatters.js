function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value ?? 0)
}

function formatNumber(value, options = {}) {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 2,
    ...options,
  }).format(value ?? 0)
}

function formatPercent(value) {
  return `${formatNumber(value)}%`
}

function formatDateTime(value) {
  if (!value) {
    return 'Non renseigné'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function toDatetimeLocalValue(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export {
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatPercent,
  toDatetimeLocalValue,
}
