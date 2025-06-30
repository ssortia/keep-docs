import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/index'
import db from '@adonisjs/lucid/services/db'
import { createAuthToken } from '#tests/helpers/auth_helper'
import Role from '#models/role'

test.group('Schema Controller', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should get schema configuration for example schema', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const response = await client
      .get('/api/v1/schemas/example')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.properties(response.body(), ['schema'])

    const schema = response.body().schema
    assert.properties(schema, ['documents'])
    assert.isArray(schema.documents)

    // Проверяем структуру документов из example.ts
    const documents = schema.documents
    assert.isAtLeast(documents.length, 3)

    // Проверяем паспорт
    const passport = documents.find((doc: any) => doc.type === 'passport')
    assert.exists(passport)
    assert.equal(passport.name, 'Паспорт')
    assert.properties(passport, ['type', 'name', 'required', 'access'])
    assert.properties(passport.required, ['statusCode'])
    assert.include(passport.required.statusCode, 'CREATION')
    assert.equal(passport.access.show, '*')
    assert.properties(passport.access.editable, ['statusCode'])
    assert.include(passport.access.editable.statusCode, 'CREATION')

    // Проверяем анкету
    const questionnaire = documents.find((doc: any) => doc.type === 'buyerQuestionnaire')
    assert.exists(questionnaire)
    assert.equal(questionnaire.name, 'Анкета')
    assert.properties(questionnaire, ['type', 'name', 'accept'])
    assert.isArray(questionnaire.accept)
    assert.include(questionnaire.accept, 'image/*')
    assert.include(questionnaire.accept, 'application/pdf')

    // Проверяем прочие документы
    const other = documents.find((doc: any) => doc.type === 'otherDocuments')
    assert.exists(other)
    assert.equal(other.name, 'Прочее')
    assert.equal(other.type, 'otherDocuments')
  })

  test('should return 401 for non-existent schema', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const response = await client
      .get('/api/v1/schemas/nonexistent_schema')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(401)
    assert.properties(response.body(), ['message'])
    assert.equal(response.body().message, 'Схема не найдена или недоступна')
  })

  test('should return 422 for empty schema name', async ({ client }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    const response = await client.get('/api/v1/schemas/').header('Authorization', `Bearer ${token}`)

    response.assertStatus(404) // Роут не найден
  })

  test('should require authentication', async ({ client }) => {
    const response = await client.get('/api/v1/schemas/example')

    response.assertStatus(401)
  })

  test('should validate schema parameter type', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    // Тестируем с числовым параметром
    const response = await client
      .get('/api/v1/schemas/123')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(401) // Схема с именем "123" не существует
    assert.equal(response.body().message, 'Схема не найдена или недоступна')
  })

  test('should handle concurrent requests to same schema', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()
    const token = await createAuthToken(user)

    // Выполняем несколько одновременных запросов
    const promises = Array.from({ length: 10 }, () =>
      client.get('/api/v1/schemas/example').header('Authorization', `Bearer ${token}`)
    )

    const responses = await Promise.all(promises)

    // Все запросы должны быть успешными
    responses.forEach((response) => {
      response.assertStatus(200)
      assert.properties(response.body(), ['schema'])
    })

    // Все ответы должны быть идентичными
    const firstResponse = responses[0].body()
    responses.slice(1).forEach((response) => {
      assert.deepEqual(response.body(), firstResponse)
    })
  })
})
