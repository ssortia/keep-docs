import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Document from '#models/document'
import Version from '#models/version'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import { compose } from '@adonisjs/core/helpers'

export default class File extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare path: string

  @column()
  declare uuid: string

  @column()
  declare originalName: string | null

  @column()
  declare extension: string | null

  @column()
  declare pageNumber: number | null

  @column()
  declare mimeType: string | null

  @column()
  declare documentId: number

  @column()
  declare versionId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => Document)
  declare document: BelongsTo<typeof Document>

  @belongsTo(() => Version)
  declare version: BelongsTo<typeof Version>
}
