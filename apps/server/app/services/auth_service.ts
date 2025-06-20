import { inject } from '@adonisjs/core'
import User from '#models/user'
import { AuthManager } from '#services/auth/auth_manager'
import { AuthProviderType } from '#contracts/auth'
import { TokenService } from '#services/token_service'

@inject()
export class AuthService {
  constructor(
    private authManager: AuthManager,
    private tokenService: TokenService
  ) {}

  async login(email: string, password: string) {
    const provider = this.authManager.getAuthProvider(AuthProviderType.LOCAL)
    return provider.authenticate({ email, password })
  }

  async register(fullName: string, email: string, password: string): Promise<User> {
    const provider = this.authManager.getAuthProvider(AuthProviderType.LOCAL)
    return provider.register({ fullName, email, password })
  }

  async getUserPermissions(user: User): Promise<{ role: string; permissions: string[] }> {
    const provider = this.authManager.getAuthProvider(AuthProviderType.LOCAL)
    return provider.getUserPermissions(user)
  }

  async handleOAuthCallback(providerType: AuthProviderType, context: any) {
    const provider = this.authManager.getOAuthProvider(providerType)
    return provider.handleCallback(context)
  }

  async getOAuthRedirectUrl(providerType: AuthProviderType, context: any) {
    const provider = this.authManager.getOAuthProvider(providerType)
    return provider.getRedirectUrl(context)
  }

  async logout(user: User): Promise<void> {
    await this.tokenService.revokeAllUserTokens(user)
  }
}
