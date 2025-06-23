import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class ApiClient extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column({
    prepare: (value: string[]) => JSON.stringify(value),
  })
  declare allowedSchemas: string[]

  @column()
  declare active: boolean

  @column()
  declare createdBy: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>

  /**
   * Проверяет, имеет ли клиент доступ к схеме
   */
  hasSchemaAccess(schema: string): boolean {
    return this.allowedSchemas.includes(schema) || this.allowedSchemas.includes('*')
  }

  /**
   * Получает список разрешенных схем как abilities для токена
   */
  getSchemaAbilities(): string[] {
    return this.allowedSchemas.map((schema) => `schema:${schema}`)
  }
}
