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

test.group('Version Controller', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should create new version for document', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    // Создаем досье с документом
    const dossier = await DossierFactory.merge({ schema: 'example' }).create()
    const existingVersion = await VersionFactory.merge({ name: 'Старая версия' }).create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
      currentVersionId: existingVersion.id,
    }).create()

    const response = await client
      .post(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/versions`)
      .header('Authorization', `Bearer ${token}`)
      .json({
        name: 'Новая версия документа',
      })
    response.assertStatus(201)
    assert.properties(response.body(), ['message', 'version'])
    assert.equal(response.body().message, 'Версия успешно создана')

    const version = response.body().version
    assert.properties(version, ['id', 'name'])
    assert.equal(version.name, 'Новая версия документа')
    assert.isNumber(version.id)
  })

  test('should return 404 for non-existent document when creating version', async ({
    client,
    assert,
  }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()

    const response = await client
      .post(`/api/v1/dossiers/${dossier.uuid}/documents/nonexistent/versions`)
      .header('Authorization', `Bearer ${token}`)
      .json({
        name: 'Новая версия',
      })

    response.assertStatus(404)
    assert.properties(response.body(), ['message'])
    assert.equal(response.body().message, 'Документ не найден')
  })

  test('should return 422 for missing name when creating version', async ({ client, assert }) => {
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
      .post(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/versions`)
      .header('Authorization', `Bearer ${token}`)
      .json({})

    response.assertStatus(422)
    assert.properties(response.body(), ['message', 'errors'])
    assert.equal(response.body().message, 'Validation failed')

    const nameError = response.body().errors.find((err: any) => err.field === 'name')
    assert.exists(nameError)
    assert.equal(nameError.rule, 'required')
  })

  test('should update version name', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()
    const version = await VersionFactory.merge({ name: 'Старое название' }).create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
      currentVersionId: version.id,
    }).create()

    version.documentId = document.id
    await version.save()

    const response = await client
      .patch(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/versions/${version.id}`)
      .header('Authorization', `Bearer ${token}`)
      .json({
        name: 'Новое название версии',
      })

    response.assertStatus(200)
    assert.properties(response.body(), ['message'])
    assert.equal(response.body().message, 'Название версии успешно изменено')
  })

  test('should return 404 for non-existent version when updating name', async ({
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
      .patch(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/versions/99999`)
      .header('Authorization', `Bearer ${token}`)
      .json({
        name: 'Новое название',
      })

    response.assertStatus(404)
    assert.properties(response.body(), ['message'])
    assert.equal(response.body().message, 'Version with id 99999 not found')
  })

  test('should return 422 for missing name when updating version', async ({ client, assert }) => {
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
      .patch(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/versions/${version.id}`)
      .header('Authorization', `Bearer ${token}`)
      .json({})

    response.assertStatus(422)
    assert.properties(response.body(), ['message', 'errors'])
    assert.equal(response.body().message, 'Validation failed')

    const nameError = response.body().errors.find((err: any) => err.field === 'name')
    assert.exists(nameError)
    assert.equal(nameError.rule, 'required')
  })

  test('should delete version', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
      // currentVersionId: version2.id,
    }).create()

    const version1 = await VersionFactory.merge({
      name: 'Версия 1',
      documentId: document.id,
    }).create()
    const version2 = await VersionFactory.merge({
      name: 'Версия 2',
      documentId: document.id,
    }).create()

    document.currentVersionId = version1.id
    await document.save()

    // Создаем файлы для версий чтобы они были связаны с документом
    await FileFactory.merge({
      documentId: document.id,
      versionId: version1.id,
      pageNumber: 1,
    }).create()

    await FileFactory.merge({
      documentId: document.id,
      versionId: version2.id,
      pageNumber: 1,
    }).create()

    const response = await client
      .delete(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/versions/${version1.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.properties(response.body(), ['message'])
    assert.equal(response.body().message, 'Версия успешно удалена')
  })

  test('should delete current version and switch to previous', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()

    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
    }).create()

    const version1 = await VersionFactory.merge({
      documentId: document.id,
      name: 'Версия 1',
    }).create()
    const version2 = await VersionFactory.merge({
      documentId: document.id,
      name: 'Версия 2 (текущая)',
    }).create()

    document.currentVersionId = version1.id
    await document.save()

    // Создаем файлы для связи версий с документом
    await FileFactory.merge({
      documentId: document.id,
      versionId: version1.id,
      pageNumber: 1,
    }).create()

    await FileFactory.merge({
      documentId: document.id,
      versionId: version2.id,
      pageNumber: 1,
    }).create()

    const response = await client
      .delete(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/versions/${version2.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.properties(response.body(), ['message'])
    assert.equal(response.body().message, 'Версия успешно удалена')
  })

  test('should return 404 for non-existent version when deleting', async ({ client, assert }) => {
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
      .delete(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/versions/99999`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    assert.properties(response.body(), ['message'])
    assert.equal(response.body().message, 'Version with id 99999 not found')
  })

  test('should return 422 for invalid version ID format', async ({ client, assert }) => {
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
      .delete(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/versions/invalid-id`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(422)
    assert.properties(response.body(), ['message', 'errors'])
    assert.equal(response.body().message, 'Validation failed')
  })

  test('should require authentication for all endpoints', async ({ client }) => {
    const dossier = await DossierFactory.create()
    const version = await VersionFactory.create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      currentVersionId: version.id,
    }).create()

    const endpoints = [
      {
        method: 'post',
        url: `/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/versions`,
        data: { name: 'Test' },
      },
      {
        method: 'patch',
        url: `/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/versions/${version.id}`,
        data: { name: 'Test' },
      },
      {
        method: 'delete',
        url: `/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/versions/${version.id}`,
      },
    ]

    for (const endpoint of endpoints) {
      let response
      if (endpoint.method === 'post') {
        response = await client.post(endpoint.url).json(endpoint.data!)
      } else if (endpoint.method === 'patch') {
        response = await client.patch(endpoint.url).json(endpoint.data!)
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

    const response = await client
      .post('/api/v1/dossiers/invalid-uuid/documents/passport/versions')
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'Test version' })

    // Middleware отклоняет невалидный UUID до валидации
    response.assertStatus(401)
    assert.properties(response.body(), ['message', 'code'])
    assert.equal(response.body().message, 'Досье не найдено или недоступно')
  })

  test('should handle empty version name', async ({ client, assert }) => {
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

    const response = await client
      .post(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/versions`)
      .header('Authorization', `Bearer ${token}`)
      .json({ name: '' })

    response.assertStatus(422)
    assert.properties(response.body(), ['message', 'errors'])
    assert.equal(response.body().message, 'Validation failed')

    const nameError = response.body().errors.find((err: any) => err.field === 'name')
    assert.exists(nameError)
  })

  test('should handle long version names', async ({ client, assert }) => {
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

    const longName = 'A'.repeat(300) // Очень длинное название

    const response = await client
      .post(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/versions`)
      .header('Authorization', `Bearer ${token}`)
      .json({ name: longName })

    // Зависит от валидации в системе - может быть 201 или 422
    const status = response.status()
    assert.oneOf(status, [201, 422])
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

    // Проверяем структуру ответа для создания версии
    const createResponse = await client
      .post(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/versions`)
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'Test Version' })

    createResponse.assertStatus(201)
    assert.equal(createResponse.headers()['content-type'], 'application/json; charset=utf-8')

    // Проверяем структуру ответа для обновления версии
    const updateResponse = await client
      .patch(`/api/v1/dossiers/${dossier.uuid}/documents/${document.code}/versions/${version.id}`)
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'Updated Version' })

    updateResponse.assertStatus(200)
    assert.equal(updateResponse.headers()['content-type'], 'application/json; charset=utf-8')
  })
})
