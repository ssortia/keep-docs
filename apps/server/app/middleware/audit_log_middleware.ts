import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import AuditLog from '#models/audit_log'
import env from '#start/env'

export default class AuditLogMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    await next()

    // Пропускаем логирование в тестовом окружении
    if (env.get('NODE_ENV') === 'test') {
      return
    }

    try {
      await this.logRequest(ctx)
    } catch (error) {
      console.error('Failed to log audit entry:', error)
    }
  }

  private async logRequest(ctx: HttpContext) {
    const { request, auth, route, response } = ctx

    const action = this.generateAction(request.method(), route?.pattern || request.url())
    const logType = this.getLogType(response.getStatus())

    const metadata = {
      method: request.method(),
      url: request.url(),
      route: route?.pattern,
      query: request.qs(),
      body: this.sanitizeBody(request.body()),
      userAgent: request.header('user-agent'),
      referer: request.header('referer'),
      bodySize: request.header('content-length'),
      statusCode: response.getStatus(),
      timestamp: new Date().toISOString(),
    }

    // Получаем IP адрес
    const ip = this.getClientIp(request)

    // Создаем запись в аудит логе
    await AuditLog.create({
      userId: auth.user?.id,
      action,
      type: logType,
      metadata,
      ip,
    })
  }

  private generateAction(method: string, pattern: string): string {
    // Создаем читаемое описание действия
    const methodMap: Record<string, string> = {
      GET: 'view',
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    }

    const actionType = methodMap[method] || method.toLowerCase()

    // Упрощаем паттерн маршрута для читаемости
    const simplifiedPattern = pattern
      .replace(/^\//, '') // убираем начальный слеш
      .replace(/\/:([^/]+)/g, '') // убираем параметры
      .replace(/\//g, '_') // заменяем слеши на подчеркивания
      .replace(/^$/, 'root') // корневой маршрут

    return `${actionType}_${simplifiedPattern}`
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body
    }

    // Рекурсивно обходим объект и маскируем поля с паролями
    return this.sanitizeObjectRecursively(body)
  }

  private sanitizeObjectRecursively(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj
    }

    // Если это массив, обрабатываем каждый элемент
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObjectRecursively(item))
    }

    // Если это не объект, возвращаем как есть
    if (typeof obj !== 'object') {
      return obj
    }

    // Создаем новый объект для безопасности
    const sanitized: any = {}

    for (const [key, value] of Object.entries(obj)) {
      // Проверяем поля, которые могут содержать пароли
      if (this.isPasswordField(key)) {
        // Заменяем все символы на звездочки, сохраняя длину
        sanitized[key] = typeof value === 'string' ? '*'.repeat(value.length) : '***'
      } else if (value && typeof value === 'object') {
        // Рекурсивно обрабатываем вложенные объекты
        sanitized[key] = this.sanitizeObjectRecursively(value)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  private isPasswordField(fieldName: string): boolean {
    // Список полей, которые могут содержать пароли
    const passwordFields = [
      'password',
      'passwd',
      'pwd',
      'secret',
      'token',
      'api_key',
      'apikey',
      'private_key',
      'privatekey',
      'auth_token',
      'access_token',
      'refresh_token',
      'password_confirmation',
      'confirm_password',
      'current_password',
      'new_password',
      'old_password',
    ]

    const lowercaseField = fieldName.toLowerCase()

    // Проверяем точные совпадения
    if (passwordFields.includes(lowercaseField)) {
      return true
    }

    // Проверяем частичные совпадения для составных полей
    return passwordFields.some(
      (field) =>
        lowercaseField.includes(field) ||
        lowercaseField.endsWith('_' + field) ||
        lowercaseField.startsWith(field + '_')
    )
  }

  private getLogType(statusCode: number): 'info' | 'warning' | 'error' {
    if (statusCode >= 500) {
      return 'error'
    } else if (statusCode >= 400) {
      return 'warning'
    } else {
      return 'info'
    }
  }

  private getClientIp(request: any): string {
    // Проверяем различные заголовки для получения реального IP
    return (
      request.header('x-forwarded-for')?.split(',')[0] ||
      request.header('x-real-ip') ||
      request.header('x-client-ip') ||
      request.ip() ||
      'unknown'
    )
  }
}
