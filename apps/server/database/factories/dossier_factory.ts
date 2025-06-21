import factory from '@adonisjs/lucid/factories'
import Dossier from '#models/dossier'

export const DossierFactory = factory
  .define(Dossier, async ({ faker }) => {
    return {
      uuid: faker.string.uuid(),
      schema: faker.helpers.arrayElement(['passport', 'snils', 'inn']),
    }
  })
  .build()