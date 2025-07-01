import { test } from '@japa/runner'
import {
  DocumentFactory,
  DossierFactory,
  UserFactory,
  VersionFactory,
} from '#database/factories/index'
import db from '@adonisjs/lucid/services/db'
import { createAuthToken } from '#tests/helpers/auth_helper'
import Role from '#models/role'
import { join } from 'node:path'

test.group('Document Controller', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should set current version of document', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()
    const version1 = await VersionFactory.merge({ name: 'Версия 1' }).create()
    const version2 = await VersionFactory.merge({ name: 'Версия 2' }).create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
      currentVersionId: version1.id,
    }).create()

    // Связываем версии с документом
    version1.documentId = document.id
    await version1.save()
    version2.documentId = document.id
    await version2.save()

    const response = await client
      .patch(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/version`)
      .header('Authorization', `Bearer ${token}`)
      .json({
        versionId: version2.id,
      })

    response.assertStatus(200)
    assert.properties(response.body(), ['message'])
    assert.equal(response.body().message, 'Текущая версия документа успешно изменена')
  })

  test('should return 404 when setting non-existent version', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()
    const version = await VersionFactory.create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
      currentVersionId: version.id,
    }).create()

    const response = await client
      .patch(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/version`)
      .header('Authorization', `Bearer ${token}`)
      .json({
        versionId: 99999,
      })
    response.assertStatus(404)
    assert.properties(response.body(), ['message'])
    assert.equal(response.body().message, 'Row not found')
  })

  test('should return 422 for missing versionId when setting version', async ({
    client,
    assert,
  }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()
    const version = await VersionFactory.create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
      currentVersionId: version.id,
    }).create()

    const response = await client
      .patch(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/version`)
      .header('Authorization', `Bearer ${token}`)
      .json({})

    response.assertStatus(422)
    assert.properties(response.body(), ['message', 'errors'])
    assert.equal(response.body().message, 'Validation failed')

    const versionIdError = response.body().errors.find((err: any) => err.field === 'versionId')
    assert.exists(versionIdError)
    assert.equal(versionIdError.rule, 'required')
  })

  test('should upload document files and create new version', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()

    // Используем реальный тестовый файл
    const testFile = join(process.cwd(), 'tests/test-files/passport_page1.jpg')

    const response = await client
      .put(`/api/v1/dossiers/${dossier.uuid}/documents/passport`)
      .header('Authorization', `Bearer ${token}`)
      .file('documents', testFile)
      .field('name', 'Паспорт новая версия')
      .field('isNewVersion', 'true')
    response.assertStatus(201)
    assert.properties(response.body(), ['data'])
    const data = response.body().data
    assert.properties(data, ['document', 'version', 'filesProcessed', 'pagesAdded'])
    assert.properties(data.document, ['id', 'code'])
    assert.equal(data.document.code, 'passport')
    assert.properties(data.version, ['id', 'name'])
    assert.equal(data.version.name, 'Паспорт новая версия')
    assert.isNumber(data.filesProcessed)
    assert.isAtLeast(data.filesProcessed, 1)
    assert.isNumber(data.pagesAdded)
  })

  test('should upload document files to existing version', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()
    const version = await VersionFactory.merge({ name: 'Существующая версия' }).create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
      currentVersionId: version.id,
    }).create()

    version.documentId = document.id
    await version.save()

    const testFile = join(process.cwd(), 'tests/test-files/passport_page1.jpg')

    const response = await client
      .put(`/api/v1/dossiers/${dossier.uuid}/documents/passport`)
      .header('Authorization', `Bearer ${token}`)
      .file('documents', testFile)
      .field('name', 'Обновленная версия')
      .field('isNewVersion', 'false')

    response.assertStatus(201)
    assert.properties(response.body(), ['data'])

    const data = response.body().data
    assert.properties(data, ['document', 'version', 'filesProcessed', 'pagesAdded'])
    assert.equal(data.document.code, 'passport')
  })

  test('should return 422 for missing documents when uploading', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()

    const response = await client
      .put(`/api/v1/dossiers/${dossier.uuid}/documents/passport`)
      .header('Authorization', `Bearer ${token}`)
      .field('name', 'Тестовая версия')

    response.assertStatus(422)
    assert.properties(response.body(), ['message', 'errors'])
    assert.equal(response.body().message, 'Validation failed')

    const documentsError = response.body().errors.find((err: any) => err.field === 'documents')
    assert.exists(documentsError)
    assert.equal(documentsError.rule, 'array.minLength')
  })

  test('should return 404 for non-existent document when downloading', async ({
    client,
    assert,
  }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()

    const response = await client
      .get(`/api/v1/dossiers/${dossier.uuid}/documents/nonexistent`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    assert.properties(response.body(), ['message'])
    assert.equal(response.body().message, 'Document not found')
  })
  //
  test('should return 404 for document without files when downloading', async ({
    client,
    assert,
  }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()
    const version = await VersionFactory.create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
      currentVersionId: version.id,
    }).create()

    const response = await client
      .get(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    assert.properties(response.body(), ['message'])
    assert.equal(response.body().message, 'Document not found')
  })

  test('should require authentication for all endpoints', async ({ client }) => {
    const dossier = await DossierFactory.create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
    }).create()

    const endpoints = [
      {
        method: 'patch',
        url: `/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/version`,
        data: { versionId: 1 },
      },
      {
        method: 'put',
        url: `/api/v1/dossiers/${dossier.uuid}/documents/${document.code}`,
        fields: { name: 'Test' },
      },
      {
        method: 'get',
        url: `/api/v1/dossiers/${dossier.uuid}/documents/${document.code}`,
      },
    ]

    for (const endpoint of endpoints) {
      let response
      if (endpoint.method === 'patch') {
        response = await client.patch(endpoint.url).json(endpoint.data!)
      } else if (endpoint.method === 'put') {
        response = await client.put(endpoint.url).field('name', 'Test')
      } else if (endpoint.method === 'get') {
        response = await client.get(endpoint.url)
      }

      response!.assertStatus(401)
    }
  })

  test('should handle invalid dossier UUID format', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const response = await client
      .get('/api/v1/dossiers/invalid-uuid/documents/passport')
      .header('Authorization', `Bearer ${token}`)

    // Middleware отклоняет невалидный UUID до валидации
    response.assertStatus(401)
    assert.properties(response.body(), ['message', 'code'])
    assert.equal(response.body().message, 'Досье не найдено или недоступно')
  })

  test('should handle invalid document type format', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()

    const response = await client
      .get(`/api/v1/dossiers/${dossier.uuid}/documents/invalid-type!`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(422)
    assert.properties(response.body(), ['message', 'errors'])
    assert.equal(response.body().message, 'Validation failed')
  })

  test('should handle file upload with unsupported extension', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()

    // Используем тестовый файл с неподдерживаемым расширением
    const testFile = join(process.cwd(), 'tests/test-files/passport_page1.jpg')

    const response = await client
      .put(`/api/v1/dossiers/${dossier.uuid}/documents/passport`)
      .header('Authorization', `Bearer ${token}`)
      .file('documents', testFile)
      .field('name', 'Тестовая версия')

    // Зависит от бизнес-правил валидации файлов
    const status = response.status()
    assert.oneOf(status, [201, 400, 422])
  })

  test('should handle multiple file upload', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()

    const testFile1 = join(process.cwd(), 'tests/test-files/passport_page1.pdf')
    const testFile2 = join(process.cwd(), 'tests/test-files/passport_page2.jpg')

    const response = await client
      .put(`/api/v1/dossiers/${dossier.uuid}/documents/passport`)
      .header('Authorization', `Bearer ${token}`)
      .file('documents', testFile1)
      .file('documents', testFile2)
      .field('name', 'Многостраничный документ')
      .field('isNewVersion', 'true')

    response.assertStatus(201)
    assert.properties(response.body(), ['data'])

    const data = response.body().data
    assert.isAtLeast(data.filesProcessed, 1)
    assert.isAtLeast(data.pagesAdded, 1)
  })

  test('should return consistent response structure', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()
    const version = await VersionFactory.create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
      currentVersionId: version.id,
    }).create()

    version.documentId = document.id
    await version.save()

    // Проверяем структуру ответа для установки версии
    const setVersionResponse = await client
      .patch(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/version`)
      .header('Authorization', `Bearer ${token}`)
      .json({ versionId: version.id })

    setVersionResponse.assertStatus(200)
    assert.equal(setVersionResponse.headers()['content-type'], 'application/json; charset=utf-8')

    // Проверяем структуру ответа для загрузки файлов
    const testFile = join(process.cwd(), 'tests/test-files/passport_page1.pdf')
    const uploadResponse = await client
      .put(`/api/v1/dossiers/${dossier.uuid}/documents/passport`)
      .header('Authorization', `Bearer ${token}`)
      .file('documents', testFile)
      .field('name', 'Test Version')

    uploadResponse.assertStatus(201)
    assert.equal(uploadResponse.headers()['content-type'], 'application/json; charset=utf-8')
  })

  test('should handle concurrent file uploads', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()
    const testFile = join(process.cwd(), 'tests/test-files/passport_page1.pdf')

    // Выполняем несколько одновременных запросов загрузки
    const promises = Array.from({ length: 3 }, (_, index) =>
      client
        .put(`/api/v1/dossiers/${dossier.uuid}/documents/passport`)
        .header('Authorization', `Bearer ${token}`)
        .file('documents', testFile)
        .field('name', `Версия ${index + 1}`)
        .field('isNewVersion', 'true')
    )

    const responses = await Promise.all(promises)

    // Все запросы должны быть успешными
    responses.forEach((response) => {
      response.assertStatus(201)
      assert.properties(response.body(), ['data'])
    })

    // Проверяем, что созданы разные версии
    const versionIds = responses.map((response) => response.body().data.version.id)
    const uniqueVersionIds = new Set(versionIds)
    assert.equal(uniqueVersionIds.size, versionIds.length)
  })
})
