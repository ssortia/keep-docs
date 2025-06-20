/*
|--------------------------------------------------------------------------
| Documents Routes
|--------------------------------------------------------------------------
|
| Routes file for document management API endpoints
|
*/

import router from '@adonisjs/core/services/router'

/**
 * API маршруты для документов
 */
router
  .group(() => {
    router.get('/:uuid/documents', '#controllers/document_controller.getDocuments')
    router.get('/:uuid/documents/:type/:number', '#controllers/document_controller.getPage')
    router.get('/:uuid/documents/:type', '#controllers/document_controller.getDocument')
    router.put('/:uuid/documents/:type', '#controllers/document_controller.addPages')
    router.delete('/:uuid/documents/:type/:pageUuid', '#controllers/document_controller.deletePage')
  })
  .prefix('/api')

export default router
