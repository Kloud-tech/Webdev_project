import process from 'node:process'

import buildApp from './app.js'
import config from './config.js'

async function start() {
  const app = await buildApp()
  try {
    await app.listen({
      host: config.host,
      port: config.port,
    })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
