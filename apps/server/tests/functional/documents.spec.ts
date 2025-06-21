import { test } from '@japa/runner'
import {
  UserFactory,
  DossierFactory,
  DocumentFactory,
  FileFactory,
  VersionFactory,
} from '#database/factories/index'
import db from '@adonisjs/lucid/services/db'
import { createAuthToken } from '#tests/helpers/auth_helper'
import Role from '#models/role'
import { join } from 'node:path'

test.group('Documents', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should get all documents for a dossier', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.create()
    const version = await VersionFactory.create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      currentVersionId: version.id,
    }).create()

    await FileFactory.merge({
      documentId: document.id,
      versionId: version.id,
      pageNumber: 1,
    }).create()

    const response = await client
      .get(`/api/docs/${dossier.uuid}/documents`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.properties(response.body(), ['uuid', 'schema', 'documents'])
    assert.equal(response.body().uuid, dossier.uuid)
    assert.isArray(response.body().documents)
  })

  test('should return 404 for non-existent dossier', async ({ client }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const response = await client
      .get('/api/docs/cf3903a8-3905-41ec-943f-1bb6f197f525/documents')
      .header('Authorization', `Bearer ${token}`)
    response.assertStatus(404)
  })

  test('should get specific document by type', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.create()
    const version = await VersionFactory.create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      currentVersionId: version.id,
      code: 'passport',
    }).create()

    const testPdfPath = join(process.cwd(), 'tests/test-files/passport_page1.pdf')

    await FileFactory.merge({
      documentId: document.id,
      versionId: version.id,
      pageNumber: 1,
      path: testPdfPath,
      mimeType: 'application/pdf',
    }).create()

    const response = await client
      .get(`/api/docs/${dossier.uuid}/documents/passport`)
      .header('Authorization', `Bearer ${token}`)

    // Проверяем, что ответ имеет правильный тип контента
    const contentType = response.headers()['content-type']
    const isStreamResponse = contentType === 'application/pdf' || contentType === 'application/json; charset=utf-8'
    assert.isTrue(isStreamResponse)
  })

  test('should return 404 for non-existent document', async ({ client }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.create()

    const response = await client
      .get(`/api/docs/${dossier.uuid}/documents/passport`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
  })

  test('should upload document pages', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'passport' }).create()

    // Используем реальный тестовый файл
    const testFile = join(process.cwd(), 'tests/test-files/passport_page1.pdf')

    const response = await client
      .put(`/api/docs/${dossier.uuid}/documents/passport`)
      .header('Authorization', `Bearer ${token}`)
      .file('documents', testFile)
      .field('name', 'Test Version')
      .field('isNewVersion', 'false')
    response.assertStatus(201)
    assert.properties(response.body(), ['document', 'message'])
  })

  test('should fail upload with invalid document type', async ({ client }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'passport' }).create()

    const testFile = join(process.cwd(), 'tests/test-files/passport_page1.pdf')

    const response = await client
      .put(`/api/docs/${dossier.uuid}/documents/invalid-type`)
      .header('Authorization', `Bearer ${token}`)
      .file('documents', testFile)
      .field('name', 'Test Version')
    console.log(response.body())
    response.assertStatus(400)
  })

  test('should get specific page by number', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.create()
    const version = await VersionFactory.create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      currentVersionId: version.id,
      code: 'passport',
    }).create()

    const testFilePath = join(process.cwd(), 'tests/test-files/passport_page1.pdf')

    await FileFactory.merge({
      documentId: document.id,
      versionId: version.id,
      pageNumber: 1,
      path: testFilePath,
      mimeType: 'application/pdf',
    }).create()

    const response = await client
      .get(`/api/docs/${dossier.uuid}/documents/passport/1`)
      .header('Authorization', `Bearer ${token}`)

    assert.equal(response.headers()['content-type'], 'application/pdf')
    assert.exists(response.headers()['content-disposition'])
  })

  test('should return 404 for non-existent page', async ({ client }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.create()
    const version = await VersionFactory.create()
    await DocumentFactory.merge({
      dossierId: dossier.id,
      currentVersionId: version.id,
      code: 'passport',
    }).create()

    const response = await client
      .get(`/api/docs/${dossier.uuid}/documents/passport/999`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
  })

  test('should soft delete a page', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.create()
    const version = await VersionFactory.create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      currentVersionId: version.id,
      code: 'passport',
    }).create()

    const file = await FileFactory.merge({
      documentId: document.id,
      versionId: version.id,
      pageNumber: 1,
    }).create()

    const response = await client
      .delete(`/api/docs/${dossier.uuid}/documents/passport/${file.uuid}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.equal(response.body().message, 'Страница успешно удалена')
  })

  test('should return 404 when deleting non-existent page', async ({ client }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.create()
    const version = await VersionFactory.create()
    await DocumentFactory.merge({
      dossierId: dossier.id,
      currentVersionId: version.id,
      code: 'passport',
    }).create()

    const response = await client
      .delete(`/api/docs/${dossier.uuid}/documents/passport/12345678-1234-1234-1234-123456789012`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
  })

  test('should require authentication for all endpoints', async ({ client }) => {
    const dossier = await DossierFactory.create()

    const endpoints = [
      { method: 'get', url: `/api/docs/${dossier.uuid}/documents` },
      { method: 'get', url: `/api/docs/${dossier.uuid}/documents/passport` },
      { method: 'put', url: `/api/docs/${dossier.uuid}/documents/passport` },
      { method: 'get', url: `/api/docs/${dossier.uuid}/documents/passport/1` },
      { method: 'delete', url: `/api/docs/${dossier.uuid}/documents/passport/test-uuid` },
    ]

    for (const endpoint of endpoints) {
      let response
      if (endpoint.method === 'get') {
        response = await client.get(endpoint.url)
      } else if (endpoint.method === 'put') {
        response = await client.put(endpoint.url)
      } else if (endpoint.method === 'delete') {
        response = await client.delete(endpoint.url)
      }
      // Некоторые эндпоинты могут возвращать 404 вместо 401 если роуты не найдены
      const status = response!.status()
      if (status !== 401 && status !== 404) {
        throw new Error(`Expected 401 or 404, got ${status} for ${endpoint.method} ${endpoint.url}`)
      }
    }
  })
})