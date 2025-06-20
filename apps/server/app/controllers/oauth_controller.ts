import { HttpContext } from '@adonisjs/core/http'
import { AuthService } from '#services/auth_service'
import { AuthProviderType } from '#contracts/auth'
import { inject } from '@adonisjs/core'

@inject()
export default class OAuthController {
  constructor(private authService: AuthService) {}

  /**
   * @githubRedirect
   * @tag OAuth
   * @summary Redirect to GitHub OAuth
   * @description Redirects user to GitHub OAuth authorization
   * @responseBody 302 - Redirect to GitHub
   */
  async githubRedirect(context: HttpContext) {
    return this.authService.getOAuthRedirectUrl(AuthProviderType.GITHUB, context)
  }

  /**
   * @githubCallback
   * @tag OAuth
   * @summary GitHub OAuth callback
   * @description Handles GitHub OAuth callback and creates/authenticates user
   * @responseBody 200 - {"user": {"id": 1, "email": "john@example.com", "fullName": "John Doe"}, "token": "oat_MjI.abc123xyz..."}
   * @responseBody 400 - {"message": "OAuth authentication failed"}
   */
  async githubCallback(context: HttpContext) {
    const { response } = context
    const { token } = await this.authService.handleOAuthCallback(AuthProviderType.GITHUB, context)

    const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${token}`
    return response.redirect(redirectUrl)
  }
}
