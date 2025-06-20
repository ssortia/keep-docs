import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'
import { Exception } from '@adonisjs/core/exceptions'
import logger from '@adonisjs/core/services/logger'
import { BusinessException } from '#exceptions/business_exceptions'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    const { response } = ctx

    this.logError(error, ctx)

    if (error instanceof errors.E_VALIDATION_ERROR) {
      return response.status(422).send({
        message: 'Validation failed',
        code: 'E_VALIDATION_ERROR',
        status: 422,
        errors: error.messages,
      })
    }

    if (error instanceof BusinessException) {
      return response.status(error.status).send({
        message: error.message,
        code: error.code,
        status: error.status,
      })
    }

    if (error instanceof Exception) {
      return response.status(error.status).send({
        message: error.message,
        code: error.code,
        status: error.status,
      })
    }

    if (error instanceof Error) {
      if (error.message === 'E_ROW_NOT_FOUND' || error.message.includes('Row not found')) {
        return response.status(404).send({
          message: 'Record not found',
          code: 'E_ROW_NOT_FOUND',
          status: 404,
        })
      }
    }

    return super.handle(error, ctx)
  }

  /**
   * Log errors for monitoring and debugging
   */
  private logError(error: unknown, ctx: HttpContext): void {
    const { request } = ctx

    // Only log non-business exceptions to avoid spam
    if (!(error instanceof BusinessException)) {
      logger.error('Unhandled error occurred', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        url: request.url(),
        method: request.method(),
        ip: request.ip(),
        userAgent: request.header('user-agent'),
        userId: ctx.auth?.user?.id,
      })
    }
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
