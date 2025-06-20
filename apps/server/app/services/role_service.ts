import { inject } from '@adonisjs/core'
import Role from '#models/role'
import { ResourceInUseException } from '#exceptions/business_exceptions'

export interface CreateRoleData {
  name: string
  description?: string
  permissions?: number[]
}

@inject()
export class RoleService {
  async createRole(data: CreateRoleData): Promise<Role> {
    const role = await Role.create({
      name: data.name,
      description: data.description,
    })

    if (data.permissions && data.permissions.length > 0) {
      await role.related('permissions').attach(data.permissions)
    }

    await role.load('permissions')
    return role
  }

  async updateRole(roleId: number, data: Partial<CreateRoleData>): Promise<Role> {
    const role = await Role.findOrFail(roleId)

    if (data.name !== undefined) role.name = data.name
    if (data.description !== undefined) role.description = data.description

    await role.save()

    if (data.permissions !== undefined) {
      await role.related('permissions').sync(data.permissions)
    }

    await role.load('permissions')
    return role
  }

  async deleteRole(roleId: number): Promise<void> {
    const role = await Role.findOrFail(roleId)

    const userCount = await role.related('users').query().count('* as total')
    if (userCount[0].$extras.total > 0) {
      throw new ResourceInUseException('Role', 'assigned users')
    }

    await role.related('permissions').detach()
    await role.delete()
  }

  async getRoleByName(name: string) {
    return Role.query().where('name', name).first()
  }
}
