import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Dossier from '#models/dossier'
import Version from '#models/version'
import File from '#models/file'

export default class Document extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare code: string

  @column()
  declare dossierId: number

  @column()
  declare currentVersionId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Dossier)
  declare dossier: BelongsTo<typeof Dossier>

  @belongsTo(() => Version, {
    foreignKey: 'currentVersionId',
  })
  declare currentVersion: BelongsTo<typeof Version>

  @hasMany(() => Version)
  declare versions: HasMany<typeof Version>

  @hasMany(() => File)
  declare files: HasMany<typeof File>

  isCurrentVersion(versionId: number): boolean {
    return this.currentVersionId === versionId
  }
}
