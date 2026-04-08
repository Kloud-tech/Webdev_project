import Trade from './trade-schema.js'

function round(value, digits = 2) {
  return Number(value.toFixed(digits))
}

function getRiskPerUnit(trade) {
  return Math.abs(trade.entryPrice - trade.stopLoss)
}

function getRewardPerUnit(trade) {
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

  if (typeof trade.riskAmount === 'number' && Number.isFinite(trade.riskAmount)) {
    return trade.riskAmount
  }

  return riskPerUnit * trade.quantity
}

function getNetPnlAmount(trade) {
  if (typeof trade.realizedPnl !== 'number' || !Number.isFinite(trade.realizedPnl)) {
    return null
  }

  return round(trade.realizedPnl)
}

function serializeTrade(trade) {
  const riskPerUnit = getRiskPerUnit(trade)
  const rewardPerUnit = getRewardPerUnit(trade)
  const grossRiskAmount = getOpenRiskAmount(trade)
  const pnlAmount = getNetPnlAmount(trade)
  const pnlPoints = trade.exitPrice === null || trade.exitPrice === undefined
    ? null
    : round((trade.exitPrice - trade.entryPrice) * getDirectionMultiplier(trade))
  const rMultiple = pnlAmount === null || grossRiskAmount === 0
    ? null
    : round(pnlAmount / grossRiskAmount)
  const targetRMultiple = grossRiskAmount === 0
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
    openedAt: trade.openedAt.toISOString(),
    closedAt: trade.closedAt ? trade.closedAt.toISOString() : null,
    createdAt: trade.createdAt.toISOString(),
    updatedAt: trade.updatedAt.toISOString(),
    analytics: {
      riskPerUnit: round(riskPerUnit),
      rewardPerUnit: round(rewardPerUnit),
      grossRiskAmount: round(grossRiskAmount),
      pnlAmount,
      pnlPoints,
      rMultiple,
      targetRMultiple,
    },
  }
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
    symbol: payload.symbol.trim().toUpperCase(),
    market: payload.market.trim(),
    side: payload.side,
    status: payload.status,
    strategy: payload.strategy.trim(),
    timeframe: payload.timeframe.trim(),
    session: payload.session.trim(),
    entryPrice: payload.entryPrice,
    stopLoss: payload.stopLoss,
    takeProfit: payload.takeProfit,
    exitPrice: payload.exitPrice ?? null,
    quantity: payload.quantity,
    riskAmount: payload.riskAmount ?? null,
    realizedPnl: payload.realizedPnl,
    fees: payload.fees ?? 0,
    conviction: payload.conviction ?? null,
    tags,
    screenshotUrl: payload.screenshotUrl?.trim() ?? '',
    setupNotes: payload.setupNotes?.trim() ?? '',
    reviewNotes: payload.reviewNotes?.trim() ?? '',
    openedAt: new Date(payload.openedAt),
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
  buildTradeDocument,
  buildTradeOverview,
  createTrade,
  serializeTrade,
  updateTrade,
}
