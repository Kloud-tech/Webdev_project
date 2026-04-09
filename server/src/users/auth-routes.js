import { randomBytes } from 'node:crypto'

import config from '../config.js'
import { sendRegistrationEmail } from '../services/mailer.js'
import User from '../users/user-schema.js'
import { hashPassword, verifyPassword } from '../utils/crypto.js'

const emailRegex = /^(?:[^<>()[\]\\.,;:\s@"]+(?:\.[^<>()[\]\\.,;:\s@"]+)*|".+")@(?:\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]|(?:[a-z\-0-9]+\.)+[a-z]{2,})$/i
const usernameRegex = /^[\w-]{3,30}$/
const minimumPasswordLength = 8

function buildAuthCookieOptions() {
  return config.jwt.cookie
}

function buildVerificationUrl(validationToken) {
  return `${config.appBaseUrl}/verify-email?token=${validationToken}`
}

function withVerificationDebugData(payload, validationToken) {
  if (config.env === 'production' && config.mail.enabled) {
    return payload
  }

  return {
    ...payload,
    verificationToken: validationToken,
    verificationUrl: buildVerificationUrl(validationToken),
  }
}

async function sendVerificationEmail(app, email, validationToken) {
  const verificationUrl = buildVerificationUrl(validationToken)
  const emailInfo = await sendRegistrationEmail({
    email,
    verificationUrl,
  })

  app.log.info({
    msg: 'Registration email sent',
    email,
    messageId: emailInfo.messageId,
  })
}

function authRoutes(app) {
  app.post('/logout', async (_request, reply) => {
    reply.clearCookie(config.jwt.cookieName, buildAuthCookieOptions())

    return reply.send({ message: 'Déconnexion réussie' })
  })

  app.post('/register', async (request, reply) => {
    const { email, password, username } = request.body ?? {}

    if (typeof email !== 'string' || typeof password !== 'string' || typeof username !== 'string') {
      return reply.status(400).send({ error: 'Email, password et username requis' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedUsername = username.trim()

    if (!emailRegex.test(normalizedEmail)) {
      return reply.status(400).send({ error: 'Email invalide' })
    }

    if (!usernameRegex.test(normalizedUsername)) {
      return reply.status(400).send({
        error: 'Username invalide. Utilisez 3 à 30 caractères alphanumériques, tirets ou underscores.',
      })
    }

    if (password.length < minimumPasswordLength) {
      return reply.status(400).send({
        error: `Le mot de passe doit contenir au moins ${minimumPasswordLength} caractères`,
      })
    }

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername },
      ],
    }).lean()

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return reply.status(409).send({ error: 'Cet email est déjà utilisé' })
      }

      return reply.status(409).send({ error: 'Ce username est déjà utilisé' })
    }

    const passwordHash = await hashPassword(password)
    const validationToken = randomBytes(32).toString('hex')

    let user

    try {
      user = await User.create({
        email: normalizedEmail,
        username: normalizedUsername,
        passwordHash,
        validationToken,
      })
    } catch (error) {
      if (error?.code === 11000) {
        if (error.keyPattern?.email) {
          return reply.status(409).send({ error: 'Cet email est déjà utilisé' })
        }

        if (error.keyPattern?.username) {
          return reply.status(409).send({ error: 'Ce username est déjà utilisé' })
        }
      }

      throw error
    }

    try {
      if (config.mail.enabled) {
        await sendVerificationEmail(app, normalizedEmail, validationToken)
      }
    } catch (error) {
      app.log.error({
        err: error,
        email: normalizedEmail,
      }, 'Failed to send registration email')

      return reply.status(503).send(withVerificationDebugData({
        error: 'Compte créé, mais l\'email de validation n\'a pas pu être envoyé. Réessayez plus tard.',
        email: user.email,
      }, validationToken))
    }

    return reply.status(201).send(withVerificationDebugData({
      message: config.mail.enabled
        ? 'Utilisateur créé avec succès. Veuillez vérifier votre email pour confirmer votre compte.'
        : 'Utilisateur créé avec succès. Utilisez le lien de validation renvoyé par l’API.',
      email: user.email,
    }, validationToken))
  })

  app.post('/resend-verification-email', async (request, reply) => {
    const { email } = request.body ?? {}

    if (typeof email !== 'string') {
      return reply.status(400).send({ error: 'Email requis' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!emailRegex.test(normalizedEmail)) {
      return reply.status(400).send({ error: 'Email invalide' })
    }

    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      return reply.status(404).send({ error: 'Utilisateur introuvable' })
    }

    if (user.emailVerified) {
      return reply.status(409).send({ error: 'Adresse email déjà validée' })
    }

    if (!user.validationToken) {
      user.validationToken = randomBytes(32).toString('hex')
      await user.save()
    }

    try {
      if (config.mail.enabled) {
        await sendVerificationEmail(app, user.email, user.validationToken)
      }
    } catch (error) {
      app.log.error({
        err: error,
        email: user.email,
      }, 'Failed to resend registration email')

      return reply.status(503).send(withVerificationDebugData({
        error: 'L’email de validation n’a pas pu être envoyé. Réessayez plus tard.',
      }, user.validationToken))
    }

    return reply.send(withVerificationDebugData({
      message: config.mail.enabled
        ? 'Email de validation renvoyé avec succès.'
        : 'Lien de validation renvoyé par l’API.',
      email: user.email,
    }, user.validationToken))
  })

  app.post('/login', async (request, reply) => {
    const { email, password } = request.body ?? {}

    if (typeof email !== 'string' || typeof password !== 'string') {
      return reply.status(400).send({ error: 'Email et mot de passe requis' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!emailRegex.test(normalizedEmail)) {
      return reply.status(400).send({ error: 'Email invalide' })
    }

    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      return reply.status(401).send({ error: 'Identifiants invalides' })
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash)
    if (!passwordMatches) {
      return reply.status(401).send({ error: 'Identifiants invalides' })
    }

    if (!user.emailVerified) {
      return reply.status(403).send({ error: 'Veuillez valider votre adresse email avant de vous connecter' })
    }

    const token = await reply.jwtSign({
      sub: user._id.toString(),
      email: user.email,
      username: user.username,
    }, {
      expiresIn: '8h',
    })

    reply.setCookie(config.jwt.cookieName, token, buildAuthCookieOptions())

    return reply.send({ message: 'Authentification réussie' })
  })
}

export default authRoutes
