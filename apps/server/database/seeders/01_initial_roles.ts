import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'
import Permission from '#models/permission'

export default class InitialRolesSeeder extends BaseSeeder {
  static environment = ['development', 'production', 'test']

  async run() {
    // Создание разрешений
    const permissions = await Permission.createMany([
      {
        name: 'users.view',
        description: 'Просмотр пользователей',
      },
      {
        name: 'users.create',
        description: 'Создание пользователей',
      },
      {
        name: 'users.edit',
        description: 'Редактирование пользователей',
      },
      {
        name: 'users.delete',
        description: 'Удаление пользователей',
      },
      {
        name: 'roles.view',
        description: 'Просмотр ролей',
      },
      {
        name: 'roles.create',
        description: 'Создание ролей',
      },
      {
        name: 'roles.edit',
        description: 'Редактирование ролей',
      },
      {
        name: 'roles.delete',
        description: 'Удаление ролей',
      },
      {
        name: 'permissions.view',
        description: 'Просмотр прав',
      },
      {
        name: 'permissions.create',
        description: 'Создание прав',
      },
      {
        name: 'permissions.edit',
        description: 'Редактирование прав',
      },
      {
        name: 'permissions.delete',
        description: 'Удаление прав',
      },
      {
        name: 'admin.access',
        description: 'Доступ к панели администратора',
      },
    ])

    // Создание ролей
    const admin = await Role.create({
      name: 'admin',
      description: 'Администратор системы',
    })

    const manager = await Role.create({
      name: 'manager',
      description: 'Менеджер',
    })

    const user = await Role.create({
      name: 'user',
      description: 'Обычный пользователь',
    })

    // Назначение разрешений для администратора (все разрешения)
    // @ts-ignore
    await admin.related('permissions').attach(permissions.map((p) => p.id))

    // Назначение разрешений для менеджера (только просмотр и редактирование)
    // @ts-ignore
    await manager
      .related('permissions')
      .attach(
        permissions
          .filter((p) => p.name.includes('.view') || p.name.includes('.edit'))
          .map((p) => p.id)
      )

    // Назначение разрешений для обычного пользователя
    // @ts-ignore
    await user
      .related('permissions')
      .attach(permissions.filter((p) => p.name === 'users.view').map((p) => p.id))
  }
}
