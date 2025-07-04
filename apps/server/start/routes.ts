/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import '#start/documents_routes'
import { middleware } from '#start/kernel'

/**
 * Маршруты аутентификации
 */
router
  .group(() => {
    router.post('/register', '#controllers/auth_controller.register')
    router.post('/login', '#controllers/auth_controller.login')
    router.get('/github', '#controllers/oauth_controller.githubRedirect')
    router.get('/github/callback', '#controllers/oauth_controller.githubCallback')
    router.get('/verify-email/:token', '#controllers/email_verifications_controller.verify')
    router.post('/resend-verification', '#controllers/email_verifications_controller.resend')

    router
      .group(() => {
        router.post('/logout', '#controllers/auth_controller.logout')
        router.get('/me', '#controllers/auth_controller.me')
        router.get('/permissions', '#controllers/auth_controller.permissions')
      })
      .middleware(middleware.auth({ guards: ['api'] }))
  })
  .prefix('/api/auth')

/**
 * API маршруты для ресурсов
 */
router
  .group(() => {
    router.resource('users', '#controllers/users_controller').use('*', middleware.resource())
    router
      .resource('permissions', '#controllers/permissions_controller')
      .use('*', middleware.resource())
    router.resource('roles', '#controllers/roles_controller').use('*', middleware.resource())
  })
  .prefix('/api')

/**
 * Прокси маршруты для KeepDocs
 */
router
  .group(() => {
    router.any('/proxy/*', '#controllers/proxy_controller.proxy')
  })
  .prefix('/api')

/**
 * Admin routes (admin only)
 */
router
  .group(() => {
    // System information
    router.get('/system/info', '#controllers/system_controller.info')

    // Audit logs
    router.get('/audit-logs', '#controllers/audit_logs_controller.index')
    router.get('/audit-logs/stats', '#controllers/audit_logs_controller.stats')
    router.get('/audit-logs/actions', '#controllers/audit_logs_controller.actions')
    router.get('/audit-logs/:id', '#controllers/audit_logs_controller.show')
  })
  .prefix('/api/admin')
  .middleware([
    middleware.auth({ guards: ['api'] }),
    middleware.permission({ permissions: ['admin.access'] }),
  ])
