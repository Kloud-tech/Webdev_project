import nodemailer from 'nodemailer'

import config from '../config.js'

function buildTransport() {
  const { host, port, secure, user, pass } = config.mail
  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    })
  }

  return nodemailer.createTransport({
    jsonTransport: true,
  })
}

const transporter = buildTransport()

export async function sendRegistrationEmail({ email, verificationUrl }) {
  const info = await transporter.sendMail({
    from: config.mail.from,
    to: email,
    subject: 'Confirmez votre inscription',
    text: `Bienvenue.\n\nConfirmez votre compte via ce lien : ${verificationUrl}`,
    html: `
      <p>Bienvenue.</p>
      <p>Confirmez votre compte via ce lien :</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
    `,
  })

  return info
}
