import { inject } from '@adonisjs/core'
import { AuthProvider, OAuthProvider, AuthProviderType } from '#contracts/auth'
import { LocalAuthProvider } from '#services/auth/local_auth_provider'
import { GitHubOAuthProvider } from '#services/auth/github_oauth_provider'

@inject()
export class AuthManager {
  private authProviders: Map<AuthProviderType, AuthProvider> = new Map()
  private oauthProviders: Map<AuthProviderType, OAuthProvider> = new Map()

  constructor(localAuthProvider: LocalAuthProvider, githubOAuthProvider: GitHubOAuthProvider) {
    this.authProviders.set(AuthProviderType.LOCAL, localAuthProvider)
    this.oauthProviders.set(AuthProviderType.GITHUB, githubOAuthProvider)
  }

  getAuthProvider(type: AuthProviderType): AuthProvider {
    const provider = this.authProviders.get(type)
    if (!provider) {
      throw new Error(`Auth provider ${type} not found`)
    }
    return provider
  }

  getOAuthProvider(type: AuthProviderType): OAuthProvider {
    const provider = this.oauthProviders.get(type)
    if (!provider) {
      throw new Error(`OAuth provider ${type} not found`)
    }
    return provider
  }
}
