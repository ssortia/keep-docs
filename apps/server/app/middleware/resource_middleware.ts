import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class ResourceMiddleware {
  redirectTo = '/login'

  async handle(ctx: HttpContext, next: NextFn) {
    const user = await ctx.auth.authenticate()
    const [entity, action] = ctx.route?.name?.split('.') as [string, string]

    const map = {
      index: 'view',
      show: 'view',
      store: 'create',
      update: 'edit',
      destroy: 'delete',
    }

    if (!map.hasOwnProperty(action)) {
      return ctx.response.badGateway({ message: `Unknown resource route: ${action}` })
    }
    const permission = `${entity}.${map[action as keyof typeof map]}`

    if (!user) {
      return ctx.response.unauthorized({ message: 'Требуется аутентификация' })
    }

    const hasPermission = await user.hasPermission(permission)

    if (!hasPermission) {
      return ctx.response.forbidden({
        message: 'Недостаточно прав доступа',
        required: {
          permission: permission,
        },
      })
    }

    await next()
  }
}
