import { test } from '@japa/runner'
import { UserFactory, RoleFactory } from '#database/factories/index'
import db from '@adonisjs/lucid/services/db'
import { createAuthToken } from '#tests/helpers/auth_helper'
import Permission from '#models/permission'

test.group('Users CRUD', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should get users list when authenticated with users.view permission', async ({
    client,
    assert,
  }) => {
    const readPermission = await Permission.findByOrFail('name', 'users.view')
    const testRole = await RoleFactory.merge({ name: 'test_reader' }).create()
    await testRole.related('permissions').attach([readPermission.id])

    const testUser = await UserFactory.merge({ roleId: testRole.id }).create()
    const token = await createAuthToken(testUser)

    const response = await client.get('/api/users').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.isArray(response.body().data)
    assert.isAtLeast(response.body().data.length, 1)
  })

  test('should fail to get users without authentication', async ({ client }) => {
    const response = await client.get('/api/users')

    response.assertStatus(401)
  })

  test('should fail to get users without users.view permission', async ({ client }) => {
    const role = await RoleFactory.merge({ name: 'test_no_permissions' }).create()
    const user = await UserFactory.merge({ roleId: role.id }).create()
    const token = await createAuthToken(user)

    const response = await client.get('/api/users').header('Authorization', `Bearer ${token}`)

    response.assertStatus(403)
  })

  test('should get specific user when authenticated with users.view permission', async ({
    client,
    assert,
  }) => {
    const readPermission = await Permission.findByOrFail('name', 'users.view')
    const testRole = await RoleFactory.merge({ name: 'test_reader2' }).create()
    await testRole.related('permissions').attach([readPermission.id])

    const testUser = await UserFactory.merge({ roleId: testRole.id }).create()
    const token = await createAuthToken(testUser)

    const targetUser = await UserFactory.create()

    const response = await client
      .get(`/api/users/${targetUser.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.equal(response.body().id, targetUser.id)
    assert.equal(response.body().email, targetUser.email)
  })

  test('should create user when authenticated with users.create permission', async ({
    client,
    assert,
  }) => {
    const createPermission = await Permission.findByOrFail('name', 'users.create')
    const testRole = await RoleFactory.merge({ name: 'test_creator' }).create()
    await testRole.related('permissions').attach([createPermission.id])

    const testUser = await UserFactory.merge({ roleId: testRole.id }).create()
    const token = await createAuthToken(testUser)

    const userData = {
      fullName: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
    }

    const response = await client
      .post('/api/users')
      .header('Authorization', `Bearer ${token}`)
      .json(userData)

    response.assertStatus(201)
    assert.equal(response.body().fullName, userData.fullName)
    assert.equal(response.body().email, userData.email)
  })

  test('should fail to create user without users.create permission', async ({ client }) => {
    const role = await RoleFactory.merge({ name: 'test_no_create' }).create()
    const user = await UserFactory.merge({ roleId: role.id }).create()
    const token = await createAuthToken(user)

    const userData = {
      fullName: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
    }

    const response = await client
      .post('/api/users')
      .header('Authorization', `Bearer ${token}`)
      .json(userData)

    response.assertStatus(403)
  })

  test('should fail to create user with duplicate email', async ({ client }) => {
    const createPermission = await Permission.findByOrFail('name', 'users.create')
    const testRole = await RoleFactory.merge({ name: 'test_creator2' }).create()
    await testRole.related('permissions').attach([createPermission.id])

    const testUser = await UserFactory.merge({ roleId: testRole.id }).create()
    const token = await createAuthToken(testUser)

    const existingUser = await UserFactory.create()

    const userData = {
      fullName: 'New User',
      email: existingUser.email, // Same email
      password: 'password123',
    }

    const response = await client
      .post('/api/users')
      .header('Authorization', `Bearer ${token}`)
      .json(userData)

    response.assertStatus(422)
  })

  test('should update user when authenticated with users.edit permission', async ({
    client,
    assert,
  }) => {
    const updatePermission = await Permission.findByOrFail('name', 'users.edit')
    const testRole = await RoleFactory.merge({ name: 'test_editor' }).create()
    await testRole.related('permissions').attach([updatePermission.id])

    const testUser = await UserFactory.merge({ roleId: testRole.id }).create()
    const token = await createAuthToken(testUser)

    const targetUser = await UserFactory.create()

    const updateData = {
      fullName: 'Updated User',
      email: 'updated@example.com',
    }

    const response = await client
      .put(`/api/users/${targetUser.id}`)
      .header('Authorization', `Bearer ${token}`)
      .json(updateData)

    response.assertStatus(200)
    assert.equal(response.body().fullName, updateData.fullName)
    assert.equal(response.body().email, updateData.email)
  })

  test('should delete user when authenticated with users.delete permission', async ({ client }) => {
    const deletePermission = await Permission.findByOrFail('name', 'users.delete')
    const testRole = await RoleFactory.merge({ name: 'test_deleter' }).create()
    await testRole.related('permissions').attach([deletePermission.id])

    const testUser = await UserFactory.merge({ roleId: testRole.id }).create()
    const token = await createAuthToken(testUser)

    const targetUser = await UserFactory.create()

    const response = await client
      .delete(`/api/users/${targetUser.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(204)
  })

  test('should fail to delete user without users.delete permission', async ({ client }) => {
    const role = await RoleFactory.merge({ name: 'test_no_delete' }).create()
    const user = await UserFactory.merge({ roleId: role.id }).create()
    const token = await createAuthToken(user)

    const targetUser = await UserFactory.create()

    const response = await client
      .delete(`/api/users/${targetUser.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(403)
  })

  test('should return 404 for non-existent user', async ({ client }) => {
    const readPermission = await Permission.findByOrFail('name', 'users.view')
    const testRole = await RoleFactory.merge({ name: 'test_reader3' }).create()
    await testRole.related('permissions').attach([readPermission.id])

    const testUser = await UserFactory.merge({ roleId: testRole.id }).create()
    const token = await createAuthToken(testUser)

    const response = await client.get('/api/users/99999').header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
  })
})
