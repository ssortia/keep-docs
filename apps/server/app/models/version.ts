import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import File from '#models/file'
import Document from '#models/document'

export default class Version extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasOne(() => Document, {
    foreignKey: 'currentVersionId',
  })
  declare document: HasOne<typeof Document>

  @hasMany(() => File)
  declare files: HasMany<typeof File>
}
