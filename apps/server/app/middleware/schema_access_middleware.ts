import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Dossier from '#models/dossier'
import {
  InvalidSchemaTokenException,
  SchemaAccessDeniedException,
} from '#exceptions/schema_exceptions'

export default class SchemaAccessMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { schema?: string } = {}) {
    const { auth, params } = ctx

    if (!auth.user) {
      throw new InvalidSchemaTokenException('Пользователь не аутентифицирован')
    }

    const token = auth.user.currentAccessToken
    if (!token) {
      throw new InvalidSchemaTokenException('Токен доступа не найден')
    }

    let schemaName: string

    if (options.schema) {
      schemaName = options.schema
    } else if (params.uuid) {
      schemaName = await this.getSchemaFromDossier(params.uuid)
    } else {
      throw new InvalidSchemaTokenException('Не удается определить схему для проверки доступа')
    }

    const hasSchemaAccess = this.checkSchemaAccess(token, schemaName)

    if (!hasSchemaAccess) {
      throw new SchemaAccessDeniedException(schemaName)
    }

    await next()
  }

  /**
   * Получает схему из досье по UUID
   */
  private async getSchemaFromDossier(uuid: string): Promise<string> {
    try {
      const dossier = await Dossier.findByOrFail('uuid', uuid)
      return dossier.schema
    } catch (error) {
      throw new InvalidSchemaTokenException('Досье не найдено или недоступно')
    }
  }

  /**
   * Проверяет доступ токена к схеме
   */
  private checkSchemaAccess(token: any, schemaName: string): boolean {
    if (!token.abilities || !Array.isArray(token.abilities)) {
      return false
    }

    return (
      token.abilities.includes(`schema:${schemaName}`) ||
      token.abilities.includes('schema:*') ||
      token.abilities.includes('*')
    )
  }
}
