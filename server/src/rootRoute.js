async function rootRoutes(fastify) {
  // Ping API
  fastify.get('/', async (_request, _reply) => {
    return {
      name: 'Trading Journal API',
      status: 'ok',
    }
  })
}

export default rootRoutes
