import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export class SchemaAccessDeniedException extends Exception {
  static status = 403
  static code = 'E_SCHEMA_ACCESS_DENIED'

  constructor(schemaName: string, message?: string) {
    super(message || `Нет доступа к схеме: ${schemaName}`, {
      status: 403,
      code: 'E_SCHEMA_ACCESS_DENIED',
    })
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      errors: [
        {
          message: error.message,
          code: error.code,
        },
      ],
    })
  }
}

export class InvalidSchemaTokenException extends Exception {
  static status = 401
  static code = 'E_INVALID_SCHEMA_TOKEN'

  constructor(message?: string) {
    super(message || 'Недействительный токен для доступа к схемам', {
      status: 401,
      code: 'E_INVALID_SCHEMA_TOKEN',
    })
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      errors: [
        {
          message: error.message,
          code: error.code,
        },
      ],
    })
  }
}

export class ApiClientInactiveException extends Exception {
  static status = 403
  static code = 'E_API_CLIENT_INACTIVE'

  constructor(clientName: string, message?: string) {
    super(message || `API клиент '${clientName}' деактивирован`, {
      status: 403,
      code: 'E_API_CLIENT_INACTIVE',
    })
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      errors: [
        {
          message: error.message,
          code: error.code,
        },
      ],
    })
  }
}
