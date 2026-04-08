const sideOptions = [
  { value: 'long', label: 'Long' },
  { value: 'short', label: 'Short' },
]

const statusOptions = [
  { value: 'planned', label: 'Planifié' },
  { value: 'open', label: 'Ouvert' },
  { value: 'closed', label: 'Clos' },
  { value: 'cancelled', label: 'Annulé' },
]

const marketOptions = [
  'Futures',
  'Indices',
  'Forex',
  'Actions',
  'Crypto',
]

const sessionOptions = [
  'Pre-market',
  'London',
  'New York Open',
  'New York AM',
  'New York PM',
  'After Hours',
]

const timeframeOptions = [
  '1m',
  '5m',
  '15m',
  '1h',
  '4h',
  '1D',
]

const strategyOptions = [
  'Breakout',
  'Pullback',
  'Range',
  'Trend continuation',
  'Reversal',
  'News',
]

export {
  marketOptions,
  sessionOptions,
  sideOptions,
  statusOptions,
  strategyOptions,
  timeframeOptions,
}
