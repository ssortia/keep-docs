import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import File from '#models/file'
import Document from '#models/document'
import { compose } from '@adonisjs/core/helpers'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import { Transactional } from 'adonisjs-transaction-decorator'

export default class Version extends compose(BaseModel, SoftDeletes, Transactional) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare documentId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => Document)
  declare document: BelongsTo<typeof Document>

  @hasOne(() => Document, {
    foreignKey: 'currentVersionId',
  })
  declare currentDocument: HasOne<typeof Document>

  @hasMany(() => File)
  declare files: HasMany<typeof File>
}
