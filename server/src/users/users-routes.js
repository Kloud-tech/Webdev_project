import config from '../config.js'
import User from './user-schema.js'

const searchableFields = ['email', 'username']
const sortableFields = new Set(['createdAt', 'email', 'username'])
const searchEscapeRegex = /[.*+?^${}()|[\]\\]/g

function buildPublicUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

function buildAuthCookieOptions() {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: config.env === 'production',
  }
}

function usersRoutes(app) {
  app.get('/verify-email', async (request, reply) => {
    const { token } = request.query ?? {}

    if (typeof token !== 'string' || token.trim().length === 0) {
      return reply.status(400).send({ error: 'Token de validation requis' })
    }

    const user = await User.findOne({ validationToken: token.trim() })

    if (!user) {
      return reply.status(404).send({ error: 'Token de validation invalide ou expiré' })
    }

    if (user.emailVerified) {
      return reply.send({ message: 'Adresse email déjà validée' })
    }

    user.emailVerified = true
    user.validationToken = null
    await user.save()

    return reply.send({
      message: 'Adresse email validée avec succès',
      user: buildPublicUser(user),
    })
  })

  app.get('/me', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    return reply.send({ user: request.currentUser })
  })

  app.get('', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const {
      page = '1',
      limit = '20',
      search,
      sortBy = 'createdAt',
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

    const filters = {}

    if (typeof search === 'string' && search.trim().length > 0) {
      const pattern = search.trim().replace(searchEscapeRegex, '\\$&')
      filters.$or = searchableFields.map(field => ({
        [field]: { $regex: pattern, $options: 'i' },
      }))
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filters),
      User.find(filters)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit)
        .lean(),
    ])

    return reply.send({
      data: users.map(buildPublicUser),
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit) || 1,
      },
    })
  })

  app.get('/:id', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const { id } = request.params

    if (!User.db.base.Types.ObjectId.isValid(id)) {
      return reply.status(400).send({ error: 'Identifiant utilisateur invalide' })
    }

    const user = await User.findById(id).lean()

    if (!user) {
      return reply.status(404).send({ error: 'Utilisateur introuvable' })
    }

    return reply.send({ user: buildPublicUser(user) })
  })

  app.delete('/:id', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const { id } = request.params

    if (!User.db.base.Types.ObjectId.isValid(id)) {
      return reply.status(400).send({ error: 'Identifiant utilisateur invalide' })
    }

    if (request.currentUser._id !== id) {
      return reply.status(403).send({ error: 'Vous ne pouvez supprimer que votre propre compte' })
    }

    const deletedUser = await User.findByIdAndDelete(id).lean()

    if (!deletedUser) {
      return reply.status(404).send({ error: 'Utilisateur introuvable' })
    }

    reply.clearCookie(config.jwt.cookieName, buildAuthCookieOptions())

    return reply.send({ message: 'Compte supprimé avec succès' })
  })
}

export default usersRoutes
