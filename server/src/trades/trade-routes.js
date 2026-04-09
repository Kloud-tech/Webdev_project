import Trade, { allowedSides, allowedStatuses } from './trade-schema.js'
import { buildTradeAnalysis, buildTradeOverview, createTrade, serializeTrade, updateTrade } from './trade-service.js'

const sortableFields = new Set(['openedAt', 'createdAt', 'symbol', 'status'])
const searchableFields = ['symbol', 'strategy', 'session', 'timeframe', 'setupNotes', 'reviewNotes']
const searchEscapeRegex = /[.*+?^${}()|[\]\\]/g

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function isOptionalFiniteNumber(value) {
  return value === null || value === undefined || isFiniteNumber(value)
}

function isOptionalString(value) {
  return value === undefined || typeof value === 'string'
}

function validateTradePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return 'Payload invalide'
  }

  const optionalStrings = ['symbol', 'market', 'strategy', 'timeframe', 'session', 'openedAt']
  const invalidStringField = optionalStrings.find(field => payload[field] !== undefined && (typeof payload[field] !== 'string'))

  if (invalidStringField) {
    return `Le champ ${invalidStringField} doit être un texte`
  }

  if (payload.side !== undefined && !allowedSides.includes(payload.side)) {
    return 'side invalide'
  }

  if (payload.status !== undefined && !allowedStatuses.includes(payload.status)) {
    return 'status invalide'
  }

  if (!isOptionalFiniteNumber(payload.entryPrice)) {
    return 'entryPrice invalide'
  }

  if (!isOptionalFiniteNumber(payload.stopLoss)) {
    return 'stopLoss invalide'
  }

  if (!isOptionalFiniteNumber(payload.takeProfit)) {
    return 'takeProfit invalide'
  }

  if (!isOptionalFiniteNumber(payload.quantity)) {
    return 'quantity invalide'
  }

  if (!isOptionalFiniteNumber(payload.exitPrice)) {
    return 'exitPrice invalide'
  }

  if (!isOptionalFiniteNumber(payload.riskAmount)) {
    return 'riskAmount invalide'
  }

  if (!isOptionalFiniteNumber(payload.realizedPnl)) {
    return 'realizedPnl invalide'
  }

  if (!isOptionalFiniteNumber(payload.fees)) {
    return 'fees invalide'
  }

  if (!isOptionalFiniteNumber(payload.conviction)) {
    return 'conviction invalide'
  }

  if (payload.conviction !== null && payload.conviction !== undefined) {
    if (!Number.isInteger(payload.conviction) || payload.conviction < 1 || payload.conviction > 5) {
      return 'conviction doit être un entier entre 1 et 5'
    }
  }

  if (!isOptionalString(payload.screenshotUrl) || !isOptionalString(payload.setupNotes) || !isOptionalString(payload.reviewNotes)) {
    return 'Champs texte invalides'
  }

  if (payload.tags !== undefined && (!Array.isArray(payload.tags) || payload.tags.some(tag => typeof tag !== 'string'))) {
    return 'tags invalide'
  }

  if (payload.openedAt !== undefined && payload.openedAt !== null && Number.isNaN(new Date(payload.openedAt).getTime())) {
    return 'openedAt invalide'
  }

  if (payload.closedAt !== undefined && payload.closedAt !== null && Number.isNaN(new Date(payload.closedAt).getTime())) {
    return 'closedAt invalide'
  }

  return null
}

function normalizeTradeFilters(query, userId) {
  const filters = { userId }

  if (typeof query.symbol === 'string' && query.symbol.trim().length > 0) {
    filters.symbol = query.symbol.trim().toUpperCase()
  }

  if (typeof query.side === 'string' && query.side.trim().length > 0) {
    filters.side = query.side.trim().toLowerCase()
  }

  if (typeof query.status === 'string' && query.status.trim().length > 0) {
    filters.status = query.status.trim().toLowerCase()
  }

  if (typeof query.dateFrom === 'string' && query.dateFrom.trim().length > 0) {
    filters.openedAt = {
      ...filters.openedAt,
      $gte: new Date(query.dateFrom),
    }
  }

  if (typeof query.dateTo === 'string' && query.dateTo.trim().length > 0) {
    filters.openedAt = {
      ...filters.openedAt,
      $lte: new Date(query.dateTo),
    }
  }

  if (typeof query.search === 'string' && query.search.trim().length > 0) {
    const pattern = query.search.trim().replace(searchEscapeRegex, '\\$&')
    filters.$or = searchableFields.map(field => ({
      [field]: { $regex: pattern, $options: 'i' },
    }))
  }

  return filters
}

function tradeRoutes(app) {
  app.get('/stats/overview', {
    onRequest: [app.authenticate],
  }, async (request) => {
    const trades = await Trade.find({ userId: request.currentUser._id })
      .sort({ openedAt: -1, createdAt: -1 })
      .lean()

    const serializedTrades = trades.map(serializeTrade)

    return {
      overview: buildTradeOverview(serializedTrades),
      recentTrades: serializedTrades.slice(0, 5),
    }
  })

  app.get('/stats/analysis', {
    onRequest: [app.authenticate],
  }, async (request) => {
    const trades = await Trade.find({ userId: request.currentUser._id })
      .sort({ openedAt: -1, createdAt: -1 })
      .lean()

    const serializedTrades = trades.map(serializeTrade)

    return {
      analysis: buildTradeAnalysis(serializedTrades),
    }
  })

  app.get('', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const {
      page = '1',
      limit = '20',
      sortBy = 'openedAt',
      sortOrder = 'desc',
    } = request.query ?? {}

    const parsedPage = Number.parseInt(page, 10)
    const parsedLimit = Number.parseInt(limit, 10)

    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      return reply.status(400).send({ error: 'page invalide' })
    }

    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return reply.status(400).send({ error: 'limit invalide' })
    }

    if (!sortableFields.has(sortBy)) {
      return reply.status(400).send({ error: 'sortBy invalide' })
    }

    if (!['asc', 'desc'].includes(sortOrder)) {
      return reply.status(400).send({ error: 'sortOrder invalide' })
    }

    const filters = normalizeTradeFilters(request.query ?? {}, request.currentUser._id)

    const [total, trades] = await Promise.all([
      Trade.countDocuments(filters),
      Trade.find(filters)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1, createdAt: -1 })
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit)
        .lean(),
    ])

    return {
      data: trades.map(serializeTrade),
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit) || 1,
      },
    }
  })

  app.get('/:id', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const { id } = request.params

    if (!Trade.db.base.Types.ObjectId.isValid(id)) {
      return reply.status(400).send({ error: 'Identifiant trade invalide' })
    }

    const trade = await Trade.findOne({
      _id: id,
      userId: request.currentUser._id,
    }).lean()

    if (!trade) {
      return reply.status(404).send({ error: 'Trade introuvable' })
    }

    return { trade: serializeTrade(trade) }
  })

  app.post('', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const validationError = validateTradePayload(request.body)

    if (validationError) {
      return reply.status(400).send({ error: validationError })
    }

    const trade = await createTrade(request.body, request.currentUser._id)
    const createdTrade = await Trade.findById(trade._id).lean()

    return reply.status(201).send({
      message: 'Trade créé avec succès',
      trade: serializeTrade(createdTrade),
    })
  })

  app.patch('/:id', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const { id } = request.params

    if (!Trade.db.base.Types.ObjectId.isValid(id)) {
      return reply.status(400).send({ error: 'Identifiant trade invalide' })
    }

    const validationError = validateTradePayload(request.body)

    if (validationError) {
      return reply.status(400).send({ error: validationError })
    }

    const trade = await updateTrade(id, request.body, request.currentUser._id)

    if (!trade) {
      return reply.status(404).send({ error: 'Trade introuvable' })
    }

    return {
      message: 'Trade mis à jour avec succès',
      trade: serializeTrade(trade),
    }
  })

  app.delete('/:id', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const { id } = request.params

    if (!Trade.db.base.Types.ObjectId.isValid(id)) {
      return reply.status(400).send({ error: 'Identifiant trade invalide' })
    }

    const trade = await Trade.findOneAndDelete({
      _id: id,
      userId: request.currentUser._id,
    }).lean()

    if (!trade) {
      return reply.status(404).send({ error: 'Trade introuvable' })
    }

    return reply.send({ message: 'Trade supprimé avec succès' })
  })
}

export default tradeRoutes
