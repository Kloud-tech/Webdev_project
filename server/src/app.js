import fastifyCors from '@fastify/cors'
import Fastify from 'fastify'

import config from './config.js'
import envToLogger from './logger.js'
import authPlugin from './plugins/auth.js'
import mongoosePlugin from './plugins/mongoose.js'
import rootRoutes from './rootRoute.js'
import tradeRoutes from './trades/trade-routes.js'
import authRoutes from './users/auth-routes.js'
import usersRoutes from './users/users-routes.js'

async function buildApp() {
  const fastify = Fastify({
    logger: envToLogger[config.env] ?? true,
    pluginTimeout: 30000,
  })

  await fastify.register(fastifyCors, {
    credentials: true,
    origin(origin, callback) {
      if (!origin) {
        callback(null, true)
        return
      }

      if (config.cors.allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('Origin non autorisée'), false)
    },
  })

  await fastify.register(authPlugin)
  await fastify.register(mongoosePlugin)
  fastify.register(authRoutes, { prefix: '/auth' })
  fastify.register(tradeRoutes, { prefix: '/trades' })
  fastify.register(usersRoutes, { prefix: '/users' })
  fastify.register(rootRoutes)

  return fastify
}

export default buildApp
