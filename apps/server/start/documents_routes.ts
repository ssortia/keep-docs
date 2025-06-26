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
 * API маршруты для документов
 */
router
  .group(() => {
    // Dossiers
    router.post('/dossiers', '#controllers/dossier_controller.create')
    router.get('/:uuid/dossier', '#controllers/dossier_controller.show')

    // Documents (meta)
    router.patch(
      '/:uuid/documents/:type/current-version',
      '#controllers/document_controller.setVersion'
    )
    router.get('/:uuid/documents/:type', '#controllers/document_controller.download')
    router.put('/:uuid/documents/:type', '#controllers/document_controller.upload')

    // Document files/pages
    router.get('/:uuid/documents/:type/:number', '#controllers/document_file_controller.getPage')
    router.delete(
      '/:uuid/documents/:type/:pageUuid',
      '#controllers/document_file_controller.deletePage'
    )

    // Schemas
    router.get('/schema/:schema', '#controllers/schema_controller.get')
  })
  .prefix('/api/docs')
  .middleware([middleware.auth({ guards: ['api'] }), middleware.schemaAccess()])

// Swagger Documentation - только для документов
router.get('/swagger', async () => {
  const filteredRoutes = router.toJSON().root.filter((route) => route.pattern.includes('/api/docs'))

  return AutoSwagger.default.docs({ root: filteredRoutes }, swagger)
})

// Swagger UI
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})

export default router
