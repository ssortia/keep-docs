import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Middleware для проверки наличия указанной роли у пользователя
 */
export default class RoleMiddleware {
  /**
   * Проверяет, имеет ли пользователь указанную роль
   */
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      roles: string[]
    }
  ) {
    // Проверка аутентификации
    const { user } = ctx.auth
    if (!user) {
      return ctx.response.unauthorized({ message: 'Требуется аутентификация' })
    }

    // Загрузка роли пользователя если она еще не загружена
    if (!user.role && user.roleId) {
      await user.load('role')
    }

    // Проверка наличия роли
    if (!user.role) {
      return ctx.response.forbidden({ message: 'Отсутствует роль пользователя' })
    }

    // Проверка соответствия роли
    const hasRequiredRole = options.roles.some((role) => user.hasRole(role))
    if (!hasRequiredRole) {
      return ctx.response.forbidden({
        message: 'Недостаточно прав доступа',
      })
    }

    // Продолжить выполнение запроса, если роль соответствует
    return next()
  }
}
