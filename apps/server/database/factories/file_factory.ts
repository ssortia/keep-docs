import factory from '@adonisjs/lucid/factories'
import File from '#models/file'

export const FileFactory = factory
  .define(File, async ({ faker }) => {
    return {
      name: faker.system.fileName(),
      originalName: faker.system.fileName(),
      path: faker.system.filePath(),
      extension: 'pdf',
      mimeType: 'application/pdf',
      pageNumber: faker.number.int({ min: 1, max: 10 }),
      uuid: faker.string.uuid(),
    }
  })
  .build()
