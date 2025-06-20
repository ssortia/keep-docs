import { inject } from '@adonisjs/core'
import User from '#models/user'
import Role from '#models/role'
import {
  AuthProvider,
  AuthenticationCredentials,
  AuthenticationResult,
  RegistrationData,
} from '#contracts/auth'
import { TokenService } from '#services/token_service'
import {
  UserBlockedException,
  EmailNotVerifiedException,
  EmailExistsException,
  UserNoRoleException,
  InvalidCredentialsException,
} from '#exceptions/auth_exceptions'

@inject()
export class LocalAuthProvider implements AuthProvider {
  constructor(private tokenService: TokenService) {}

  async authenticate(credentials: AuthenticationCredentials): Promise<AuthenticationResult> {
    let user
    try {
      user = await User.verifyCredentials(credentials.email, credentials.password)
    } catch (error) {
      throw new InvalidCredentialsException()
    }

    this.validateUser(user)

    await user.load('role')
    const token = await this.tokenService.generateAccessToken(user)

    return { user, token }
  }

  async register(data: RegistrationData): Promise<User> {
    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      throw new EmailExistsException()
    }

    const defaultRole = await Role.findByOrFail('name', 'user')
    const emailVerificationToken = this.generateEmailVerificationToken()

    const user = await User.create({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      roleId: defaultRole.id,
      blocked: false,
      isEmailVerified: true,
      emailVerificationToken,
    })

    await user.load('role')
    return user
  }

  async getUserPermissions(user: User): Promise<{ role: string; permissions: string[] }> {
    await user.load('role', (query) => {
      query.preload('permissions')
    })

    if (!user.role) {
      throw new UserNoRoleException()
    }

    return {
      role: user.role.name,
      permissions: user.role.permissions.map((p) => p.name),
    }
  }

  private validateUser(user: User): void {
    if (user.blocked) {
      throw new UserBlockedException()
    }

    if (!user.isEmailVerified) {
      throw new EmailNotVerifiedException()
    }
  }

  private generateEmailVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
}
