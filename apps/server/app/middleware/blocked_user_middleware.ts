import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'

export default class BlockedUserMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn) {
    const user = auth.use('api').user

    if (user && user.blocked) {
      // Удаляем все токены заблокированного пользователя
      const tokens = await User.accessTokens.all(user)
      await Promise.all(tokens.map((token) => User.accessTokens.delete(user, token.identifier)))

      return response.forbidden({
        message: 'Ваш аккаунт заблокирован. Обратитесь к администратору',
      })
    }

    const output = await next()
    return output
  }
}
