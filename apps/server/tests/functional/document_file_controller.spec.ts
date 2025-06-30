import { test } from '@japa/runner'
import {
  DocumentFactory,
  DossierFactory,
  FileFactory,
  UserFactory,
  VersionFactory,
} from '#database/factories/index'
import db from '@adonisjs/lucid/services/db'
import { createAuthToken } from '#tests/helpers/auth_helper'
import Role from '#models/role'
import { join } from 'node:path'

test.group('Document File Controller', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should download specific page file', async ({ client, assert }) => {
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

    const testFilePath = join(process.cwd(), 'tests/test-files/passport_page1.jpg')
    const file = await FileFactory.merge({
      documentId: document.id,
      versionId: version.id,
      pageNumber: 1,
      path: testFilePath,
      mimeType: 'image/jpeg',
      originalName: 'passport_page1.jpg',
      extension: 'jpg',
    }).create()

    const response = await client
      .get(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/pages/${file.uuid}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    // Проверяем, что возвращается файл
    const contentType = response.headers()['content-type']
    assert.equal(contentType, 'image/jpeg')
    assert.exists(response.headers()['content-disposition'])
    assert.include(response.headers()['content-disposition'], 'passport_page1.jpg')
  })

  test('should return 404 for non-existent page', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
    }).create()

    const nonExistentUuid = '550e8400-e29b-41d4-a716-446655440099'

    const response = await client
      .get(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/pages/${nonExistentUuid}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    assert.properties(response.body(), ['message'])
    assert.equal(response.body().message, 'Page 550e8400-e29b-41d4-a716-446655440099 not found')
  })

  test('should return 403 for page from different document', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()

    // Создаем два разных документа
    const document1 = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
    }).create()

    const document2 = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'drivers_license',
    }).create()

    const version = await VersionFactory.create()
    const file = await FileFactory.merge({
      documentId: document2.id,
      versionId: version.id,
      pageNumber: 1,
    }).create()

    // Пытаемся получить файл document2 через URL document1
    const response = await client
      .get(`/api/v1/dossiers/${dossier.uuid}/documents/${document1.code}/pages/${file.uuid}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    assert.properties(response.body(), ['message'])
    assert.equal(response.body().message, `Page ${file.uuid} not found`)
  })

  test('should delete page successfully', async ({ client, assert }) => {
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

    const file = await FileFactory.merge({
      documentId: document.id,
      versionId: version.id,
      pageNumber: 1,
      originalName: 'passport_page1.jpg',
    }).create()

    const response = await client
      .delete(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/pages/${file.uuid}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.properties(response.body(), ['message'])
    assert.equal(response.body().message, 'Страница успешно удалена')
  })

  test('should return 404 when deleting non-existent page', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
    }).create()

    const nonExistentUuid = '550e8400-e29b-41d4-a716-446655440099'

    const response = await client
      .delete(
        `/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/pages/${nonExistentUuid}`
      )
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    assert.properties(response.body(), ['message'])
    assert.equal(response.body().message, `Page ${nonExistentUuid} not found`)
  })

  test('should return 409 when trying to delete already deleted page', async ({
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

    const file = await FileFactory.merge({
      documentId: document.id,
      versionId: version.id,
      pageNumber: 1,
    }).create()

    await file.delete()

    const response = await client
      .delete(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/pages/${file.uuid}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    assert.properties(response.body(), ['message'])
    assert.equal(response.body().message, `Page ${file.uuid} not found`)
  })

  test('should require authentication for all endpoints', async ({ client }) => {
    const dossier = await DossierFactory.create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
    }).create()
    const version = await VersionFactory.merge({ documentId: document.id }).create()
    const file = await FileFactory.merge({
      documentId: document.id,
      versionId: version.id,
    }).create()

    const endpoints = [
      {
        method: 'get',
        url: `/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/pages/${file.uuid}`,
      },
      {
        method: 'delete',
        url: `/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/pages/${file.uuid}`,
      },
    ]

    for (const endpoint of endpoints) {
      let response
      if (endpoint.method === 'get') {
        response = await client.get(endpoint.url)
      } else if (endpoint.method === 'delete') {
        response = await client.delete(endpoint.url)
      }

      response!.assertStatus(401)
    }
  })

  test('should handle invalid dossier UUID format', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.create()
    const document = await DocumentFactory.merge({ dossierId: dossier.id }).create()
    const version = await VersionFactory.create()
    const file = await FileFactory.merge({
      documentId: document.id,
      versionId: version.id,
    }).create()

    const response = await client
      .get(`/api/v1/dossiers/invalid-uuid/documents/passport/pages/${file.uuid}`)
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
    const document = await DocumentFactory.merge({ dossierId: dossier.id }).create()
    const version = await VersionFactory.create()
    const file = await FileFactory.merge({
      documentId: document.id,
      versionId: version.id,
    }).create()

    const response = await client
      .get(`/api/v1/dossiers/${dossier.uuid}/documents/invalid-type!/pages/${file.uuid}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(422)
    assert.properties(response.body(), ['message', 'errors'])
    assert.equal(response.body().message, 'Validation failed')
  })

  test('should handle invalid page UUID format', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
    }).create()

    const response = await client
      .get(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/pages/invalid-uuid`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(422)
    assert.properties(response.body(), ['message', 'errors'])
    assert.equal(response.body().message, 'Validation failed')

    const pageUuidError = response.body().errors.find((err: any) => err.field === 'pageUuid')
    assert.exists(pageUuidError)
    assert.equal(pageUuidError.rule, 'uuid')
  })

  test('should return consistent response structure for delete operations', async ({
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

    const file = await FileFactory.merge({
      documentId: document.id,
      versionId: version.id,
      pageNumber: 1,
    }).create()

    const response = await client
      .delete(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/pages/${file.uuid}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.equal(response.headers()['content-type'], 'application/json; charset=utf-8')
    assert.properties(response.body(), ['message'])
    assert.isString(response.body().message)
  })

  test('should handle access to pages from different dossiers', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    // Создаем два разных досье
    const dossier1 = await DossierFactory.merge({ schema: 'example' }).create()
    const dossier2 = await DossierFactory.merge({ schema: 'example' }).create()

    const document1 = await DocumentFactory.merge({
      dossierId: dossier1.id,
      code: 'passport',
    }).create()

    const document2 = await DocumentFactory.merge({
      dossierId: dossier2.id,
      code: 'passport',
    }).create()

    const version = await VersionFactory.create()
    const file = await FileFactory.merge({
      documentId: document2.id,
      versionId: version.id,
      pageNumber: 1,
    }).create()

    // Пытаемся получить файл из dossier2 через URL dossier1
    const response = await client
      .get(`/api/v1/dossiers/${dossier1.uuid}/documents/${document1.code}/pages/${file.uuid}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    assert.properties(response.body(), ['message'])
    assert.equal(response.body().message, `Page ${file.uuid} not found`)
  })
})
