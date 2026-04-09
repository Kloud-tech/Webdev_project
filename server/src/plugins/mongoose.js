import mongoose from 'mongoose'

import config from '../config.js'

async function mongoosePlugin(fastify) {
  // Connexion Mongo
  fastify.log.info(`Connecting to MongoDB...`)

  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 30000,
  })
  fastify.log.info('Connected to MongoDB')

  fastify.addHook('onClose', async () => {
    await mongoose.connection.close()
  })
}

export default mongoosePlugin
