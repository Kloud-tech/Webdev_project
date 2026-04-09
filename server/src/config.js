import process from 'node:process'

const env = process.env.NODE_ENV || 'development'
const appBaseUrl = process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`
const allowedOrigins = (process.env.ALLOWED_ORIGINS || appBaseUrl)
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

export default {
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 3000,
  env,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:35115/myapp',
  appBaseUrl,
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    cookieName: process.env.JWT_COOKIE_NAME || 'token',
    cookie: {
      path: '/',
      httpOnly: true,
      sameSite: env === 'production' ? 'none' : 'lax',
      secure: env === 'production',
    },
  },
  cors: {
    allowedOrigins,
  },
  mail: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || 'no-reply@example.com',
    enabled: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
  },
}
