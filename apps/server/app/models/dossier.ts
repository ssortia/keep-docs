import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Document from '#models/document'
import { compose } from '@adonisjs/core/helpers'
import { Transactional } from 'adonisjs-transaction-decorator'

export default class Dossier extends compose(BaseModel, Transactional) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare schema: string

  @column()
  declare uuid: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Document)
  declare documents: HasMany<typeof Document>
}
