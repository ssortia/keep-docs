import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class AuditLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare action: string

  @column()
  declare metadata: Record<string, any> | null

  @column()
  declare ip: string | null

  @column()
  declare type: 'info' | 'warning' | 'error'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Scopes для фильтрации
  static byType = scope((query, type: 'info' | 'warning' | 'error') => {
    query.where('type', type)
  })

  static byAction = scope((query, action: string) => {
    query.where('action', 'ilike', `%${action}%`)
  })

  static byUser = scope((query, userId: number) => {
    query.where('userId', userId)
  })

  static byDateRange = scope((query, dateFrom: DateTime, dateTo?: DateTime) => {
    query.where('createdAt', '>=', dateFrom.startOf('day').toSQL()!)
    if (dateTo) {
      query.where('createdAt', '<=', dateTo.endOf('day').toSQL()!)
    }
  })

  static search = scope((query, searchTerm: string) => {
    query.where((builder) => {
      builder
        .where('action', 'ilike', `%${searchTerm}%`)
        .orWhere('ip', 'ilike', `%${searchTerm}%`)
        // @ts-ignore
        .orWhereHas('user', (userBuilder) => {
          userBuilder
            // @ts-ignore
            .where('email', 'ilike', `%${searchTerm}%`)
            .orWhere('fullName', 'ilike', `%${searchTerm}%`)
        })
    })
  })
}
