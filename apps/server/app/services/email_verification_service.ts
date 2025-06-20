import { inject } from '@adonisjs/core'
import User from '#models/user'
import { EmailService } from '#services/email_service'
import VerificationEmailNotification from '#mails/verification_email_notification'
import { UserNotFoundException } from '#exceptions/auth_exceptions'
import { InvalidTokenException } from '#exceptions/business_exceptions'

@inject()
export class EmailVerificationService {
  constructor(private emailService: EmailService) {}

  async sendVerificationEmail(email: string): Promise<void> {
    const user = await User.findBy('email', email)

    if (!user) {
      throw new UserNotFoundException()
    }

    if (user.isEmailVerified) {
      return
    }

    const token = this.generateVerificationToken()
    user.emailVerificationToken = token
    await user.save()

    await this.emailService.send(new VerificationEmailNotification(user, token))
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await User.findBy('emailVerificationToken', token)

    if (!user) {
      throw new InvalidTokenException('Verification token')
    }

    user.isEmailVerified = true
    user.emailVerificationToken = null
    await user.save()

    return user
  }

  private generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
}
