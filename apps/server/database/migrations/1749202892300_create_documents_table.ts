import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'documents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('code', 255).notNullable()
      table.integer('dossier_id').notNullable().references('id').inTable('dossiers')
      table.integer('current_version_id').notNullable().references('id').inTable('versions')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
