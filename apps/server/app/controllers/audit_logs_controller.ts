import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import AuditLogService from '#services/audit_log_service'

@inject()
export default class AuditLogsController {
  constructor(private auditLogService: AuditLogService) {}

  async index({ request, response }: HttpContext) {
    const filters: any = {}
    if (request.input('type')) filters.type = request.input('type')
    if (request.input('action')) filters.action = request.input('action')
    if (request.input('userId')) filters.userId = request.input('userId')
    if (request.input('search')) filters.search = request.input('search')
    if (request.input('dateFrom')) filters.dateFrom = request.input('dateFrom')
    if (request.input('dateTo')) filters.dateTo = request.input('dateTo')

    const sort = {
      sortBy: request.input('sortBy', 'createdAt'),
      sortOrder: request.input('sortOrder', 'desc'),
    }

    const pagination = {
      page: request.input('page', 1),
      limit: request.input('limit', 20),
    }
    const result = await this.auditLogService.getAuditLogs(filters, sort, pagination)

    return response.json(result)
  }

  async show({ params, response }: HttpContext) {
    const auditLog = await this.auditLogService.getAuditLogById(params.id)
    return response.ok(auditLog)
  }

  async stats({ request, response }: HttpContext) {
    const period = request.input('period', 'day')
    const stats = await this.auditLogService.getStats(period)
    return response.ok(stats)
  }

  async actions({ response }: HttpContext) {
    const actions = await this.auditLogService.getAvailableActions()
    return response.ok({ actions })
  }
}
