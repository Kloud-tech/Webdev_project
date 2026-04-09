import Trade from './trade-schema.js'

function round(value, digits = 2) {
  return Number(value.toFixed(digits))
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function roundOptional(value, digits = 2) {
  return isFiniteNumber(value) ? round(value, digits) : null
}

function average(values) {
  const numbers = values.filter(isFiniteNumber)

  if (numbers.length === 0) {
    return null
  }

  return round(numbers.reduce((sum, value) => sum + value, 0) / numbers.length)
}

function sum(values) {
  return round(values.filter(isFiniteNumber).reduce((total, value) => total + value, 0))
}

function getRiskPerUnit(trade) {
  if (!isFiniteNumber(trade.entryPrice) || !isFiniteNumber(trade.stopLoss)) {
    return null
  }

  return Math.abs(trade.entryPrice - trade.stopLoss)
}

function getRewardPerUnit(trade) {
  if (!isFiniteNumber(trade.takeProfit) || !isFiniteNumber(trade.entryPrice)) {
    return null
  }

  return Math.abs(trade.takeProfit - trade.entryPrice)
}

function getDirectionMultiplier(trade) {
  return trade.side === 'long' ? 1 : -1
}

function getOpenRiskAmount(trade) {
  const riskPerUnit = getRiskPerUnit(trade)

  if (riskPerUnit === 0) {
    return 0
  }

  if (isFiniteNumber(trade.riskAmount)) {
    return trade.riskAmount
  }

  if (!isFiniteNumber(riskPerUnit) || !isFiniteNumber(trade.quantity)) {
    return null
  }

  return riskPerUnit * trade.quantity
}

function getNetPnlAmount(trade) {
  if (!isFiniteNumber(trade.realizedPnl)) {
    return null
  }

  return round(trade.realizedPnl)
}

function serializeTrade(trade) {
  const riskPerUnit = getRiskPerUnit(trade)
  const rewardPerUnit = getRewardPerUnit(trade)
  const grossRiskAmount = getOpenRiskAmount(trade)
  const pnlAmount = getNetPnlAmount(trade)
  const pnlPoints = !isFiniteNumber(trade.exitPrice) || !isFiniteNumber(trade.entryPrice)
    ? null
    : round((trade.exitPrice - trade.entryPrice) * getDirectionMultiplier(trade))
  const rMultiple = pnlAmount === null || !isFiniteNumber(grossRiskAmount) || grossRiskAmount === 0
    ? null
    : round(pnlAmount / grossRiskAmount)
  const targetRMultiple = !isFiniteNumber(grossRiskAmount) || !isFiniteNumber(rewardPerUnit) || !isFiniteNumber(trade.quantity) || grossRiskAmount === 0
    ? null
    : round((rewardPerUnit * trade.quantity) / grossRiskAmount)

  return {
    id: trade._id.toString(),
    userId: trade.userId.toString(),
    symbol: trade.symbol,
    market: trade.market,
    side: trade.side,
    status: trade.status,
    strategy: trade.strategy,
    timeframe: trade.timeframe,
    session: trade.session,
    entryPrice: trade.entryPrice,
    stopLoss: trade.stopLoss,
    takeProfit: trade.takeProfit,
    exitPrice: trade.exitPrice,
    quantity: trade.quantity,
    riskAmount: trade.riskAmount,
    realizedPnl: trade.realizedPnl,
    fees: trade.fees,
    conviction: trade.conviction,
    tags: trade.tags,
    screenshotUrl: trade.screenshotUrl,
    setupNotes: trade.setupNotes,
    reviewNotes: trade.reviewNotes,
    openedAt: trade.openedAt ? trade.openedAt.toISOString() : null,
    closedAt: trade.closedAt ? trade.closedAt.toISOString() : null,
    createdAt: trade.createdAt.toISOString(),
    updatedAt: trade.updatedAt.toISOString(),
    analytics: {
      riskPerUnit: roundOptional(riskPerUnit),
      rewardPerUnit: roundOptional(rewardPerUnit),
      grossRiskAmount: roundOptional(grossRiskAmount),
      pnlAmount,
      pnlPoints,
      rMultiple,
      targetRMultiple,
    },
  }
}

function normalizeOptionalNumber(value) {
  return isFiniteNumber(value) ? value : null
}

function buildTradeDocument(payload, userId) {
  const tags = Array.isArray(payload.tags)
    ? payload.tags
        .map(tag => String(tag).trim())
        .filter(Boolean)
        .slice(0, 12)
    : []

  return {
    userId,
    symbol: payload.symbol?.trim().toUpperCase() ?? '',
    market: payload.market?.trim() ?? '',
    side: payload.side || 'long',
    status: payload.status || 'planned',
    strategy: payload.strategy?.trim() ?? '',
    timeframe: payload.timeframe?.trim() ?? '',
    session: payload.session?.trim() ?? '',
    entryPrice: normalizeOptionalNumber(payload.entryPrice),
    stopLoss: normalizeOptionalNumber(payload.stopLoss),
    takeProfit: normalizeOptionalNumber(payload.takeProfit),
    exitPrice: normalizeOptionalNumber(payload.exitPrice),
    quantity: normalizeOptionalNumber(payload.quantity),
    riskAmount: normalizeOptionalNumber(payload.riskAmount),
    realizedPnl: normalizeOptionalNumber(payload.realizedPnl),
    fees: normalizeOptionalNumber(payload.fees) ?? 0,
    conviction: normalizeOptionalNumber(payload.conviction),
    tags,
    screenshotUrl: payload.screenshotUrl?.trim() ?? '',
    setupNotes: payload.setupNotes?.trim() ?? '',
    reviewNotes: payload.reviewNotes?.trim() ?? '',
    openedAt: payload.openedAt ? new Date(payload.openedAt) : new Date(),
    closedAt: payload.closedAt ? new Date(payload.closedAt) : null,
  }
}

function buildTradeOverview(trades) {
  const closedTrades = trades.filter(trade => trade.status === 'closed' && trade.analytics.pnlAmount !== null)
  const winningTrades = closedTrades.filter(trade => trade.analytics.pnlAmount > 0)
  const losingTrades = closedTrades.filter(trade => trade.analytics.pnlAmount < 0)
  const netPnl = closedTrades.reduce((sum, trade) => sum + trade.analytics.pnlAmount, 0)
  const avgR = closedTrades.length > 0
    ? round(closedTrades.reduce((sum, trade) => sum + (trade.analytics.rMultiple ?? 0), 0) / closedTrades.length)
    : 0

  return {
    totalTrades: trades.length,
    openTrades: trades.filter(trade => trade.status === 'open').length,
    plannedTrades: trades.filter(trade => trade.status === 'planned').length,
    closedTrades: closedTrades.length,
    winRate: closedTrades.length > 0 ? round((winningTrades.length / closedTrades.length) * 100) : 0,
    netPnl,
    averageR: avgR,
    bestTrade: winningTrades.length > 0
      ? winningTrades.reduce((best, trade) => trade.analytics.pnlAmount > best.analytics.pnlAmount ? trade : best)
      : null,
    worstTrade: losingTrades.length > 0
      ? losingTrades.reduce((worst, trade) => trade.analytics.pnlAmount < worst.analytics.pnlAmount ? trade : worst)
      : null,
  }
}

function buildBreakdown(trades, key) {
  const groups = new Map()

  trades.forEach((trade) => {
    const label = trade[key] || 'Non renseigné'
    const current = groups.get(label) || []
    current.push(trade)
    groups.set(label, current)
  })

  return Array.from(groups.entries(), ([label, items]) => {
    const closedItems = items.filter(trade => trade.status === 'closed' && trade.analytics.pnlAmount !== null)
    const winningItems = closedItems.filter(trade => trade.analytics.pnlAmount > 0)
    const netPnl = sum(closedItems.map(trade => trade.analytics.pnlAmount))

    return {
      label,
      count: items.length,
      closedCount: closedItems.length,
      netPnl,
      winRate: closedItems.length > 0 ? round((winningItems.length / closedItems.length) * 100) : null,
      averagePnl: average(closedItems.map(trade => trade.analytics.pnlAmount)),
    }
  })
    .sort((a, b) => {
      const scoreA = a.netPnl ?? Number.NEGATIVE_INFINITY
      const scoreB = b.netPnl ?? Number.NEGATIVE_INFINITY
      return scoreB - scoreA
    })
}

function buildTradeAnalysis(trades) {
  const closedTrades = trades.filter(trade => trade.status === 'closed' && trade.analytics.pnlAmount !== null)
  const winningTrades = closedTrades.filter(trade => trade.analytics.pnlAmount > 0)
  const losingTrades = closedTrades.filter(trade => trade.analytics.pnlAmount < 0)
  const openTrades = trades.filter(trade => trade.status === 'open')
  const plannedTrades = trades.filter(trade => trade.status === 'planned')
  const cancelledTrades = trades.filter(trade => trade.status === 'cancelled')

  const totalFees = sum(trades.map(trade => trade.fees))
  const grossProfits = sum(winningTrades.map(trade => trade.analytics.pnlAmount))
  const grossLosses = Math.abs(sum(losingTrades.map(trade => trade.analytics.pnlAmount)))
  const profitFactor = grossLosses > 0 ? round(grossProfits / grossLosses) : null
  const averageWinner = average(winningTrades.map(trade => trade.analytics.pnlAmount))
  const averageLoser = average(losingTrades.map(trade => trade.analytics.pnlAmount))
  const averagePnl = average(closedTrades.map(trade => trade.analytics.pnlAmount))
  const averageHoldHours = average(closedTrades.map((trade) => {
    if (!trade.openedAt || !trade.closedAt) {
      return null
    }

    const duration = new Date(trade.closedAt).getTime() - new Date(trade.openedAt).getTime()
    return duration > 0 ? duration / (1000 * 60 * 60) : null
  }))

  const bySession = buildBreakdown(trades, 'session')
  const byStrategy = buildBreakdown(trades, 'strategy')
  const bySide = buildBreakdown(trades, 'side')

  const bestSession = bySession.find(item => item.closedCount > 0) || null
  const bestStrategy = byStrategy.find(item => item.closedCount > 0) || null
  const bestSide = bySide.find(item => item.closedCount > 0) || null
  const weakestSession = bySession.toReversed().find(item => item.closedCount > 0) || null
  const weakestStrategy = byStrategy.toReversed().find(item => item.closedCount > 0) || null

  const insights = []

  if (closedTrades.length === 0) {
    insights.push('Clôture quelques trades pour obtenir une analyse plus fiable de ton journal.')
  }

  if (profitFactor !== null && profitFactor < 1) {
    insights.push('Tes pertes brutes dépassent tes gains bruts. Le point à revoir en priorité est la gestion des sorties.')
  }

  if (plannedTrades.length > closedTrades.length) {
    insights.push('Tu as beaucoup de trades encore planifiés par rapport aux trades terminés. Le journal sera plus utile si tu mets les statuts à jour plus souvent.')
  }

  if (bestSession && weakestSession && bestSession.label !== weakestSession.label && bestSession.netPnl > weakestSession.netPnl) {
    insights.push(`Tes meilleurs résultats viennent surtout de la session ${bestSession.label}. À l’inverse, la session ${weakestSession.label} semble moins régulière.`)
  }

  if (bestStrategy && weakestStrategy && bestStrategy.label !== weakestStrategy.label && bestStrategy.netPnl > weakestStrategy.netPnl) {
    insights.push(`La stratégie ${bestStrategy.label} ressort mieux que ${weakestStrategy.label}. Tu peux peut-être concentrer plus de trades sur ce qui fonctionne déjà.`)
  }

  if (averageWinner !== null && averageLoser !== null && Math.abs(averageLoser) > averageWinner) {
    insights.push('Tes pertes moyennes sont plus grandes que tes gains moyens. Il faudrait sûrement couper plus vite les mauvais trades ou laisser respirer un peu plus les bons.')
  }

  if (totalFees > 0 && averagePnl !== null && Math.abs(totalFees) > Math.abs(averagePnl)) {
    insights.push('Les frais commencent à peser sur le journal. Vérifie si certains trades trop petits ou trop fréquents valent vraiment le coup.')
  }

  if (insights.length === 0) {
    insights.push('Le journal est plutôt propre. Continue surtout à remplir les statuts, le PnL et quelques notes de review pour avoir une analyse plus précise.')
  }

  return {
    summary: {
      totalTrades: trades.length,
      closedTrades: closedTrades.length,
      openTrades: openTrades.length,
      plannedTrades: plannedTrades.length,
      cancelledTrades: cancelledTrades.length,
      winRate: closedTrades.length > 0 ? round((winningTrades.length / closedTrades.length) * 100) : 0,
      netPnl: sum(closedTrades.map(trade => trade.analytics.pnlAmount)),
      averagePnl,
      averageWinner,
      averageLoser,
      profitFactor,
      totalFees,
      averageHoldHours,
    },
    highlights: {
      bestSession,
      bestStrategy,
      bestSide,
    },
    breakdowns: {
      bySession,
      byStrategy,
      bySide,
    },
    insights,
  }
}

async function createTrade(payload, userId) {
  const trade = await Trade.create(buildTradeDocument(payload, userId))
  return trade
}

async function updateTrade(tradeId, payload, userId) {
  const trade = await Trade.findOneAndUpdate(
    { _id: tradeId, userId },
    buildTradeDocument(payload, userId),
    { new: true, runValidators: true },
  )

  return trade
}

export {
  buildTradeAnalysis,
  buildTradeDocument,
  buildTradeOverview,
  createTrade,
  serializeTrade,
  updateTrade,
}
