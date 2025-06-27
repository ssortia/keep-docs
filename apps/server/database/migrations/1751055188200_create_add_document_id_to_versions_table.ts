import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'versions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('document_id').unsigned().references('id').inTable('documents').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('document_id')
    })
  }
}