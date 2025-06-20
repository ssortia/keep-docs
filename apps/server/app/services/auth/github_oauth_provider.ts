import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import type { GithubDriver } from '@adonisjs/ally/drivers/github'
import { OAuthProvider, AuthenticationResult, OAuthUserData } from '#contracts/auth'
import { TokenService } from '#services/token_service'
import { UserBlockedException, OAuthException } from '#exceptions/auth_exceptions'
import User from '#models/user'
import Role from '#models/role'

@inject()
export class GitHubOAuthProvider implements OAuthProvider {
  constructor(private tokenService: TokenService) {}

  async handleCallback(context: HttpContext): Promise<AuthenticationResult> {
    const { ally } = context
    const github = ally.use('github') as GithubDriver

    try {
      const error = this.getOAuthError(github)
      if (error) {
        throw new OAuthException(error)
      }

      const githubUser = await github.user()
      const oauthUserData: OAuthUserData = {
        id: githubUser.id.toString(),
        name: githubUser.name,
        nickName: githubUser.nickName,
        email: githubUser.email,
        provider: 'github',
      }

      let user = await this.findByGitHub(oauthUserData.id, oauthUserData.email)

      if (user) {
        user = await this.updateGitHubInfo(user, oauthUserData.id)
      } else {
        user = await this.createUserFromOAuth(oauthUserData)
      }

      this.validateUser(user)

      const token = await this.tokenService.generateAccessToken(user)
      return { user, token }
    } catch (error) {
      if (error instanceof UserBlockedException || error instanceof OAuthException) {
        throw error
      }
      throw new OAuthException('OAuth authentication failed')
    }
  }

  async getRedirectUrl(context: HttpContext): Promise<void> {
    const { ally } = context
    const github = ally.use('github') as GithubDriver
    return github.redirect()
  }

  private getOAuthError(github: GithubDriver): string | null {
    if (github.accessDenied()) {
      return 'Access was denied'
    }

    if (github.hasError()) {
      return github.getError() || 'Unknown OAuth error'
    }

    return null
  }

  private async findByGitHub(githubId: string, email: string): Promise<User | null> {
    return User.query().where('github_id', githubId).orWhere('email', email).preload('role').first()
  }

  private async updateGitHubInfo(user: User, githubId: string): Promise<User> {
    if (!user.githubId) {
      user.githubId = githubId
      user.provider = 'github'
      await user.save()
    }
    return user
  }

  private async createUserFromOAuth(oauthData: OAuthUserData): Promise<User> {
    const defaultRole = await Role.findByOrFail('name', 'user')
    const user = await User.create({
      fullName: oauthData.name || oauthData.nickName || 'GitHub User',
      email: oauthData.email,
      password: Math.random().toString(36),
      githubId: oauthData.id,
      provider: oauthData.provider,
      roleId: defaultRole.id,
      blocked: false,
      isEmailVerified: true,
      emailVerificationToken: undefined,
    })

    await user.load('role')
    return user
  }

  private validateUser(user: any): void {
    if (user.blocked) {
      throw new UserBlockedException()
    }
  }
}
