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

/**
 * API маршруты для документов
 */
router
  .group(() => {
    // Dossiers
    router.post('/dossiers', '#controllers/dossier_controller.create')
    router.get('/:uuid/dossier', '#controllers/dossier_controller.show')

    // Documents (meta)
    router.get('/:uuid/documents', '#controllers/document_controller.list')
    router.patch(
      '/:uuid/documents/:type/current-version',
      '#controllers/document_controller.setVersion'
    )

    // Document files/pages
    router.put('/:uuid/documents/:type', '#controllers/document_file_controller.upload')
    router.get('/:uuid/documents/:type', '#controllers/document_file_controller.download')
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

export default router
