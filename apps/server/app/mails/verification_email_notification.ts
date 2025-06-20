import { BaseMail } from '@adonisjs/mail'
import User from '#models/user'
import { Edge } from 'edge.js'
import { join } from 'node:path'

export default class VerificationEmailNotification extends BaseMail {
  from = process.env.SMTP_USERNAME
  subject = 'Подтверждение регистрации'

  constructor(
    private user: User,
    private token: string
  ) {
    super()
  }

  async prepare() {
    const verificationUrl = `${process.env.CLIENT_URL || 'http://127.0.0.1:3030'}/verify-email/${this.token}`

    const edge = Edge.create()
    const templatePath = join(process.cwd(), 'resources/views')
    edge.mount(templatePath)

    const html = await edge.render('emails/verify_email', {
      user: this.user,
      verificationUrl,
    })

    this.message.to(this.user.email).html(html)
  }
}
