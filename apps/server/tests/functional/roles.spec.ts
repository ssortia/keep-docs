import { test } from '@japa/runner'
import { UserFactory, RoleFactory } from '#database/factories/index'
import db from '@adonisjs/lucid/services/db'
import { createAuthToken } from '#tests/helpers/auth_helper'
import Permission from '#models/permission'
import Role from '#models/role'

test.group('Roles CRUD', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should get roles list when authenticated with roles.view permission', async ({
    client,
    assert,
  }) => {
    const viewPermission = await Permission.findByOrFail('name', 'roles.view')
    const testRole = await RoleFactory.merge({ name: 'test' }).create()
    await testRole.related('permissions').attach([viewPermission.id])

    const testUser = await UserFactory.merge({ roleId: testRole.id }).create()
    const token = await createAuthToken(testUser)

    const response = await client.get('/api/roles').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.isArray(response.body().data)
    assert.isAtLeast(response.body().data.length, 3)
  })

  test('should fail to get roles without roles.view permission', async ({ client }) => {
    const role = await RoleFactory.merge({ name: 'user_test' }).create()
    const user = await UserFactory.merge({ roleId: role.id }).create()
    const token = await createAuthToken(user)

    const response = await client.get('/api/roles').header('Authorization', `Bearer ${token}`)

    response.assertStatus(403)
  })

  test('should create role when authenticated with roles.create permission', async ({
    client,
    assert,
  }) => {
    const createPermission = await Permission.findByOrFail('name', 'roles.create')
    const testRole = await RoleFactory.merge({ name: 'test' }).create()
    await testRole.related('permissions').attach([createPermission.id])

    const testUser = await UserFactory.merge({ roleId: testRole.id }).create()
    const token = await createAuthToken(testUser)

    const roleData = {
      name: 'new_role',
      description: 'A new test role',
    }

    const response = await client
      .post('/api/roles')
      .header('Authorization', `Bearer ${token}`)
      .json(roleData)

    response.assertStatus(201)
    assert.equal(response.body().name, roleData.name)
    assert.equal(response.body().description, roleData.description)
  })

  test('should fail to create role with duplicate name', async ({ client }) => {
    const createPermission = await Permission.findByOrFail('name', 'roles.create')
    const testRole = await RoleFactory.merge({ name: 'test' }).create()
    await testRole.related('permissions').attach([createPermission.id])

    const testUser = await UserFactory.merge({ roleId: testRole.id }).create()
    const token = await createAuthToken(testUser)

    const existingRole = await Role.findByOrFail('name', 'admin')

    const roleData = {
      name: existingRole.name,
      description: 'A duplicate role',
    }

    const response = await client
      .post('/api/roles')
      .header('Authorization', `Bearer ${token}`)
      .json(roleData)

    response.assertStatus(422)
  })

  test('should update role when authenticated with roles.edit permission', async ({
    client,
    assert,
  }) => {
    const editPermission = await Permission.findByOrFail('name', 'roles.edit')
    const testRole = await RoleFactory.merge({ name: 'test' }).create()
    await testRole.related('permissions').attach([editPermission.id])

    const testUser = await UserFactory.merge({ roleId: testRole.id }).create()
    const token = await createAuthToken(testUser)

    const targetRole = await Role.findByOrFail('name', 'manager')

    const updateData = {
      name: 'updated_role',
      description: 'Updated description',
    }

    const response = await client
      .put(`/api/roles/${targetRole.id}`)
      .header('Authorization', `Bearer ${token}`)
      .json(updateData)

    response.assertStatus(200)
    assert.equal(response.body().name, updateData.name)
    assert.equal(response.body().description, updateData.description)
  })

  test('should delete role when authenticated with roles.delete permission', async ({ client }) => {
    const deletePermission = await Permission.findByOrFail('name', 'roles.delete')
    const testRole = await RoleFactory.merge({ name: 'test' }).create()
    await testRole.related('permissions').attach([deletePermission.id])

    const testUser = await UserFactory.merge({ roleId: testRole.id }).create()
    const token = await createAuthToken(testUser)

    const targetRole = await RoleFactory.create()

    const response = await client
      .delete(`/api/roles/${targetRole.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(204)
  })

  test('should assign permissions to role', async ({ client, assert }) => {
    const editPermission = await Permission.findByOrFail('name', 'roles.edit')
    const testRole = await RoleFactory.merge({ name: 'test' }).create()
    await testRole.related('permissions').attach([editPermission.id])

    const testUser = await UserFactory.merge({ roleId: testRole.id }).create()
    const token = await createAuthToken(testUser)

    const targetRole = await RoleFactory.create()
    const permissions = await Permission.query().where('name', 'LIKE', 'users.%').limit(3)
    const response = await client
      .put(`/api/roles/${targetRole.id}`)
      .header('Authorization', `Bearer ${token}`)
      .json({
        name: targetRole.name,
        description: targetRole.description,
        permissions: permissions.map((p) => p.id),
      })

    response.assertStatus(200)
    await targetRole.load('permissions')
    assert.equal(targetRole.permissions.length, 3)
  })
})
