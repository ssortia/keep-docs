import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Role from '#models/role'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare roleId: number | null

  @column()
  declare blocked: boolean

  @column()
  declare isEmailVerified: boolean

  @column()
  declare emailVerificationToken: string | null

  @column()
  declare githubId: string | null

  @column()
  declare provider: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  static accessTokens = DbAccessTokensProvider.forModel(User)

  /**
   * Сериализует пользователя для ответа API
   */
  serialize(fields = {}) {
    return {
      ...super.serialize(fields),
      role: this.role ? this.role.serialize() : null,
    }
  }

  /**
   * Проверяет, имеет ли пользователь указанную роль
   */
  hasRole(roleName: string): boolean {
    return this.role?.name === roleName
  }

  /**
   * Проверяет, имеет ли пользователь хотя бы одно из указанных разрешений
   */
  async hasPermission(permission: string): Promise<boolean> {
    if (!this.roleId) {
      return false
    }

    // @ts-ignore
    await this.load('role', (query) => {
      // @ts-ignore
      query.preload('permissions')
    })
    return this.role.permissions.some((p) => p.name === permission)
  }

  /**
   * Проверяет, имеет ли пользователь все указанные разрешения
   */
  async hasAllPermissions(permissions: string[]): Promise<boolean> {
    if (!this.roleId) {
      return false
    }

    // @ts-ignore
    await this.load('role', (query) => {
      // @ts-ignore
      query.preload('permissions')
    })

    return permissions.every((permission) =>
      this.role.permissions.some((p) => p.name === permission)
    )
  }

  /**
   * Проверяет, имеет ли пользователь хотя бы одно из указанных разрешений
   */
  async hasAnyPermission(permissions: string[]): Promise<boolean> {
    if (!this.roleId) {
      return false
    }

    // @ts-ignore
    await this.load('role', (query) => {
      // @ts-ignore
      query.preload('permissions')
    })

    return permissions.some((permission) =>
      this.role.permissions.some((p) => p.name === permission)
    )
  }
}
