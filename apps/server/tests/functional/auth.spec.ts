import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/index'
import db from '@adonisjs/lucid/services/db'
import { createAuthToken } from '#tests/helpers/auth_helper'
import Role from '#models/role'

test.group('Auth', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should register a new user successfully', async ({ client, assert }) => {
    const userData = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    }

    const response = await client.post('/api/auth/register').json(userData)
    response.assertStatus(200)
    assert.properties(response.body(), ['message', 'user'])
    assert.equal(response.body().user.email, userData.email)
    assert.equal(response.body().user.fullName, userData.fullName)
    assert.isFalse(response.body().user.isEmailVerified)
  })

  test('should fail registration with invalid email', async ({ client }) => {
    const userData = {
      fullName: 'Test User',
      email: 'invalid-email',
      password: 'password123',
      passwordConfirmation: 'password123',
    }

    const response = await client.post('/api/auth/register').json(userData)

    response.assertStatus(422)
  })

  test('should fail registration with password mismatch', async ({ client }) => {
    const userData = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      passwordConfirmation: 'different-password',
    }

    const response = await client.post('/api/auth/register').json(userData)

    response.assertStatus(422)
  })

  test('should login with correct credentials', async ({ client, assert }) => {
    const user = await UserFactory.merge({ password: 'password123' }).create()
    const response = await client.post('/api/auth/login').json({
      email: user.email,
      password: 'password123',
    })
    response.assertStatus(200)
    assert.properties(response.body(), ['user', 'token'])
    assert.equal(response.body().user.email, user.email)
    assert.exists(response.body().token)
  })

  test('should fail login with wrong password', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'password123' }).create()

    const response = await client.post('/api/auth/login').json({
      email: user.email,
      password: 'wrong-password',
    })

    response.assertStatus(400)
  })

  test('should fail login with non-existent email', async ({ client }) => {
    const response = await client.post('/api/auth/login').json({
      email: 'nonexistent@example.com',
      password: 'password123',
    })

    response.assertStatus(400)
  })

  test('should fail login when user is blocked', async ({ client }) => {
    const user = await UserFactory.merge({
      password: 'password123',
      blocked: true,
    }).create()

    const response = await client.post('/api/auth/login').json({
      email: user.email,
      password: 'password123',
    })

    response.assertStatus(403)
  })

  test('should get user profile when authenticated', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const token = await createAuthToken(user)

    const response = await client.get('/api/auth/me').header('Authorization', `Bearer ${token}`)
    response.assertStatus(200)
    assert.equal(response.body().user.email, user.email)
    assert.equal(response.body().user.fullName, user.fullName)
  })

  test('should fail to get profile without token', async ({ client }) => {
    const response = await client.get('/api/auth/me')

    response.assertStatus(401)
  })

  test('should logout successfully', async ({ client }) => {
    const user = await UserFactory.create()
    const token = await createAuthToken(user)

    const response = await client
      .post('/api/auth/logout')
      .header('Authorization', `Bearer ${token}`)
    response.assertStatus(204)
  })

  test('should get user permissions when authenticated', async ({ client, assert }) => {
    const userRole = await Role.findBy('name', 'user')
    const user = await UserFactory.merge({ roleId: userRole!.id }).create()

    const token = await createAuthToken(user)

    const response = await client
      .get('/api/auth/permissions')
      .header('Authorization', `Bearer ${token}`)
    response.assertStatus(200)
    assert.isArray(response.body().permissions)
  })
})
