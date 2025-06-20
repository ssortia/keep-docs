import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Middleware для проверки наличия указанных прав у пользователя
 */
export default class PermissionMiddleware {
  /**
   * Проверяет, имеет ли пользователь указанные права
   */
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      permissions: string[]
      mode?: 'all' | 'any'
    }
  ) {
    const { user } = ctx.auth
    if (!user) {
      return ctx.response.unauthorized({ message: 'Требуется аутентификация' })
    }

    const mode = options.mode || 'all'
    const hasPermission =
      mode === 'all'
        ? await user.hasAllPermissions(options.permissions)
        : await user.hasAnyPermission(options.permissions)

    if (!hasPermission) {
      return ctx.response.forbidden({
        message: 'Недостаточно прав доступа',
        required: {
          permissions: options.permissions,
          mode,
        },
      })
    }

    return next()
  }
}
