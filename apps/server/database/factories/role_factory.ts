import factory from '@adonisjs/lucid/factories'
import Role from '#models/role'
import PermissionFactory from './permission_factory.js'

const RoleFactory = factory
  .define(Role, async ({ faker }) => {
    return {
      name: faker.word.adjective({ length: 1 }),
      description: faker.lorem.sentence(),
    }
  })
  .relation('permissions', () => PermissionFactory)
  .build()

export default RoleFactory
export { RoleFactory }
