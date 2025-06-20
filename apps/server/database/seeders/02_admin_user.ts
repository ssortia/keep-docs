import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Role from '#models/role'

export default class AdminUserSeeder extends BaseSeeder {
  static environment = ['development']

  async run() {
    const adminRole = await Role.findBy('name', 'admin')

    await User.create({
      fullName: 'Test Admin',
      email: 'test@mail.ru',
      password: '123123',
      isEmailVerified: true,
      blocked: false,
      roleId: adminRole!.id,
    })
  }
}
