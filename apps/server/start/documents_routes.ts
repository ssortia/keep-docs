/*
|--------------------------------------------------------------------------
| Documents Routes
|--------------------------------------------------------------------------
|
| Routes file for document management API endpoints
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

/**
 * API маршруты для документов (REST)
 */
router
  .group(() => {
    // Dossiers resource
    router.post('/dossiers', '#controllers/dossier_controller.create')
    router.get('/dossiers/:uuid', '#controllers/dossier_controller.show')

    // Documents resource (nested under dossiers)
    router.get('/dossiers/:uuid/documents/:type', '#controllers/document_controller.download')
    router.put('/dossiers/:uuid/documents/:type', '#controllers/document_controller.upload')
    router.patch(
      '/dossiers/:uuid/documents/:type/version',
      '#controllers/document_controller.setVersion'
    )

    // Document pages resource (nested under documents)
    router.get(
      '/dossiers/:uuid/documents/:type/pages/:pageUuid',
      '#controllers/document_file_controller.getPage'
    )
    router.delete(
      '/dossiers/:uuid/documents/:type/pages/:pageUuid',
      '#controllers/document_file_controller.deletePage'
    )

    // Schemas resource
    router.get('/schemas/:schema', '#controllers/schema_controller.get')
  })
  .prefix('/api')
  .middleware([middleware.auth({ guards: ['api'] }), middleware.schemaAccess()])

// Swagger Documentation
router.get('/swagger', async () => {
  const documentsRoutes = router
    .toJSON()
    .root.filter(
      (route) => route.pattern.includes('/dossiers') || route.pattern.includes('/schemas')
    )

  return AutoSwagger.default.docs({ root: documentsRoutes }, swagger)
})

// Swagger UI
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})

export default router
