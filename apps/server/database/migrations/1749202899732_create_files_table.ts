import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'files'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 255).notNullable()
      table.string('path', 255).notNullable()
      table.uuid('uuid').notNullable()
      table.string('original_name', 255)
      table.string('extension', 255)
      table.integer('page_number').nullable()
      table.string('mime_type', 255)
      table.integer('document_id').notNullable().references('id').inTable('documents')
      table.integer('version_id').notNullable().references('id').inTable('versions')

      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
