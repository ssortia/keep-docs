import mail from '@adonisjs/mail/services/main'
import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'

export class EmailService {
  async send(mailInstance: BaseMail) {
    if (env.get('NODE_ENV') === 'test') {
      console.log('Email sending skipped in test environment')
      return
    }

    try {
      await mail.send(mailInstance)
    } catch (error) {
      console.log('Email sending failed:', error.message)
    }
  }
}
