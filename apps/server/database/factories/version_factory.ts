import factory from '@adonisjs/lucid/factories'
import Version from '#models/version'

export const VersionFactory = factory
  .define(Version, async ({ faker }) => {
    return {
      name: faker.lorem.words(2),
    }
  })
  .build()
