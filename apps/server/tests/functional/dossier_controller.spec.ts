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

test.group('Dossier Controller', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should create new dossier with auto-generated UUID', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const response = await client
      .post('/api/v1/dossiers')
      .header('Authorization', `Bearer ${token}`)
      .json({
        schema: 'example',
      })
    console.log(response.body())
    response.assertStatus(201)
    assert.properties(response.body(), ['data'])

    const dossier = response.body().data
    assert.properties(dossier, ['uuid', 'schema', 'createdAt'])
    assert.equal(dossier.schema, 'example')
    assert.match(dossier.uuid, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })

  test('should create new dossier with provided UUID', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const customUuid = crypto.randomUUID()

    const response = await client
      .post('/api/v1/dossiers')
      .header('Authorization', `Bearer ${token}`)
      .json({
        schema: 'example',
        uuid: customUuid,
      })
    response.assertStatus(201)
    assert.properties(response.body(), ['data'])

    const dossier = response.body().data
    assert.equal(dossier.uuid, customUuid)
    assert.equal(dossier.schema, 'example')
  })

  test('should return 401 for missing schema field', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const response = await client
      .post('/api/v1/dossiers')
      .header('Authorization', `Bearer ${token}`)
      .json({})

    response.assertStatus(401)
    assert.properties(response.body(), ['message', 'code'])
    assert.equal(response.body().message, 'Не удается определить схему для проверки доступа')
  })

  test('should return 422 for invalid UUID format', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const response = await client
      .post('/api/v1/dossiers')
      .header('Authorization', `Bearer ${token}`)
      .json({
        schema: 'example',
        uuid: 'invalid-uuid-format',
      })

    response.assertStatus(422)
    assert.properties(response.body(), ['message', 'errors'])
    assert.equal(response.body().message, 'Validation failed')

    const uuidError = response.body().errors.find((err: any) => err.field === 'uuid')
    assert.exists(uuidError)
  })

  test('should show existing dossier with documents', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    // Создаем досье с документом
    const dossier = await DossierFactory.merge({ schema: 'example' }).create()
    const version = await VersionFactory.merge({ name: 'Паспорт v1' }).create()
    const document = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
      currentVersionId: version.id,
    }).create()

    await FileFactory.merge({
      documentId: document.id,
      versionId: version.id,
      pageNumber: 1,
    }).create()

    await FileFactory.merge({
      documentId: document.id,
      versionId: version.id,
      pageNumber: 2,
    }).create()

    const response = await client
      .get(`/api/v1/dossiers/${dossier.uuid}`)
      .header('Authorization', `Bearer ${token}`)
      .qs({ schema: 'example' })

    response.assertStatus(200)
    assert.properties(response.body(), [
      'id',
      'uuid',
      'schema',
      'documents',
      'createdAt',
      'updatedAt',
    ])
    assert.equal(response.body().uuid, dossier.uuid)
    assert.equal(response.body().schema, 'example')
    assert.isArray(response.body().documents)
    assert.equal(response.body().documents.length, 1)

    const doc = response.body().documents[0]
    assert.properties(doc, ['id', 'code', 'currentVersion', 'versions', 'filesCount'])
    assert.equal(doc.code, 'passport')
    assert.equal(doc.filesCount, 2)
    assert.properties(doc.currentVersion, ['id', 'name', 'createdAt', 'files'])
    assert.equal(doc.currentVersion.name, 'Паспорт v1')
    assert.isArray(doc.versions)
  })

  test('should create dossier if it does not exist when showing', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const newUuid = crypto.randomUUID()

    const response = await client
      .get(`/api/v1/dossiers/${newUuid}`)
      .header('Authorization', `Bearer ${token}`)
      .qs({ schema: 'example' })

    response.assertStatus(200)
    assert.properties(response.body(), ['id', 'uuid', 'schema', 'documents'])
    assert.equal(response.body().uuid, newUuid)
    assert.equal(response.body().schema, 'example')
    assert.isArray(response.body().documents)
    assert.equal(response.body().documents.length, 0)
  })

  test('should show dossier with multiple documents and versions', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()

    // Создаем первый документ с двумя версиями
    await VersionFactory.merge({ name: 'Паспорт v1' }).create()
    const version2 = await VersionFactory.merge({ name: 'Паспорт v2' }).create()
    const document1 = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'passport',
      currentVersionId: version2.id,
    }).create()

    // Создаем второй документ
    const version3 = await VersionFactory.merge({ name: 'СНИЛС v1' }).create()
    const document2 = await DocumentFactory.merge({
      dossierId: dossier.id,
      code: 'snils',
      currentVersionId: version3.id,
    }).create()

    // Добавляем файлы
    await FileFactory.merge({
      documentId: document1.id,
      versionId: version2.id,
      pageNumber: 1,
    }).create()

    await FileFactory.merge({
      documentId: document2.id,
      versionId: version3.id,
      pageNumber: 1,
    }).create()

    const response = await client
      .get(`/api/v1/dossiers/${dossier.uuid}`)
      .header('Authorization', `Bearer ${token}`)
      .qs({ schema: 'example' })

    response.assertStatus(200)
    assert.equal(response.body().documents.length, 2)

    const passportDoc = response.body().documents.find((doc: any) => doc.code === 'passport')
    const snilsDoc = response.body().documents.find((doc: any) => doc.code === 'snils')

    assert.exists(passportDoc)
    assert.exists(snilsDoc)

    assert.equal(passportDoc.currentVersion.name, 'Паспорт v2')
    assert.equal(snilsDoc.currentVersion.name, 'СНИЛС v1')
  })

  test('should return 422 for invalid UUID format in show', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const response = await client
      .get('/api/v1/dossiers/invalid-uuid')
      .header('Authorization', `Bearer ${token}`)
      .qs({ schema: 'example' })

    response.assertStatus(422)
    assert.properties(response.body(), ['message', 'errors'])
    assert.equal(response.body().message, 'Validation failed')
  })

  test('should require authentication for create endpoint', async ({ client }) => {
    const response = await client.post('/api/v1/dossiers').json({ schema: 'example' })

    response.assertStatus(401)
  })

  test('should require authentication for show endpoint', async ({ client }) => {
    const dossier = await DossierFactory.create()

    const response = await client.get(`/api/v1/dossiers/${dossier.uuid}`).qs({ schema: 'example' })

    response.assertStatus(401)
  })

  test('should handle concurrent create requests', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    // Выполняем несколько одновременных запросов на создание
    const promises = Array.from({ length: 3 }, () =>
      client
        .post('/api/v1/dossiers')
        .header('Authorization', `Bearer ${token}`)
        .json({ schema: 'example' })
    )

    const responses = await Promise.all(promises)

    // Все запросы должны быть успешными
    responses.forEach((response) => {
      response.assertStatus(201)
      assert.properties(response.body(), ['data'])
    })

    // UUID должны быть уникальными
    const uuids = responses.map((response) => response.body().data.uuid)
    const uniqueUuids = new Set(uuids)
    assert.equal(uniqueUuids.size, uuids.length)
  })

  test('should handle empty documents array correctly', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const dossier = await DossierFactory.merge({ schema: 'example' }).create()

    const response = await client
      .get(`/api/v1/dossiers/${dossier.uuid}`)
      .header('Authorization', `Bearer ${token}`)
      .qs({ schema: 'example' })

    response.assertStatus(200)
    assert.isArray(response.body().documents)
    assert.equal(response.body().documents.length, 0)
  })

  test('should return consistent response structure', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    // Тестируем create
    const createResponse = await client
      .post('/api/v1/dossiers')
      .header('Authorization', `Bearer ${token}`)
      .json({ schema: 'example' })

    createResponse.assertStatus(201)
    assert.equal(createResponse.headers()['content-type'], 'application/json; charset=utf-8')

    // Тестируем show
    const uuid = createResponse.body().data.uuid
    const showResponse = await client
      .get(`/api/v1/dossiers/${uuid}`)
      .header('Authorization', `Bearer ${token}`)
      .qs({ schema: 'example' })

    showResponse.assertStatus(200)
    assert.equal(showResponse.headers()['content-type'], 'application/json; charset=utf-8')
  })
})
