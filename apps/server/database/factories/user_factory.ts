import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import RoleFactory from './role_factory.js'

const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      fullName: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: 'password123',
      blocked: false,
      isEmailVerified: true,
      emailVerificationToken: null,
      githubId: null,
      provider: 'local',
    }
  })
  .relation('role', () => RoleFactory)
  .build()

export default UserFactory
export { UserFactory }
