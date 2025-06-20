import factory from '@adonisjs/lucid/factories'
import Permission from '#models/permission'

const PermissionFactory = factory
  .define(Permission, async ({ faker }) => {
    return {
      name: faker.helpers.arrayElement([
        'create_user',
        'read_user',
        'update_user',
        'delete_user',
        'manage_roles',
        'manage_permissions',
        'view_audit_logs',
      ]),
      description: faker.lorem.sentence(),
    }
  })
  .build()

export default PermissionFactory
export { PermissionFactory }
