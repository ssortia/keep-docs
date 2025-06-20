import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Base class for business logic exceptions
 */
export abstract class BusinessException extends Exception {
  abstract readonly code: string
  abstract readonly status: number

  async handle(error: this, ctx: HttpContext) {
    return ctx.response.status(error.status).send({
      message: error.message,
      code: error.code,
      status: error.status,
    })
  }
}

/**
 * Resource in use exception (cannot be deleted)
 */
export class ResourceInUseException extends BusinessException {
  constructor(
    resource: string = 'Resource',
    dependency: string = 'other records',
    options?: ErrorOptions
  ) {
    super(`${resource} cannot be deleted because it is used by ${dependency}`, options)
  }

  readonly code = 'E_RESOURCE_IN_USE'
  readonly status = 400
}

/**
 * Invalid token exception
 */
export class InvalidTokenException extends BusinessException {
  constructor(tokenType: string = 'Token', options?: ErrorOptions) {
    super(`${tokenType} is invalid or expired`, options)
  }

  readonly code = 'E_INVALID_TOKEN'
  readonly status = 400
}

/**
 * Invalid token exception
 */
export class ConstraintException extends BusinessException {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
  }

  readonly code = 'E_INVALID_TOKEN'
  readonly status = 422
}
