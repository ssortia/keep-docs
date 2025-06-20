import type { HttpContext } from '@adonisjs/core/http'
import { EmailVerificationService } from '#services/email_verification_service'
import { inject } from '@adonisjs/core'

@inject()
export default class EmailVerificationsController {
  constructor(private emailVerificationService: EmailVerificationService) {}
  async verify({ params }: HttpContext) {
    const token = params.token
    await this.emailVerificationService.verifyEmail(token)

    return {
      message: 'Email успешно подтвержден',
    }
  }

  async resend({ request }: HttpContext) {
    const { email } = request.only(['email'])
    await this.emailVerificationService.sendVerificationEmail(email)

    return {
      message: 'Письмо для подтверждения отправлено повторно',
    }
  }
}
