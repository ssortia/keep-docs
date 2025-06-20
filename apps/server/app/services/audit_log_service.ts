import AuditLog from '#models/audit_log'
import { DateTime } from 'luxon'

export interface AuditLogFilters {
  type?: 'info' | 'warning' | 'error'
  action?: string
  userId?: number
  search?: string
  dateFrom?: string
  dateTo?: string
}

export interface AuditLogSort {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface AuditLogPagination {
  page?: number
  limit?: number
}

export interface AuditLogStats {
  totals: {
    total: number
    info: number
    warning: number
    error: number
    period: number
  }
  topActions: Array<{ action: string; count: number }>
  topUsers: Array<{ userId: number; user: any; count: number }>
}

export default class AuditLogService {
  async getAuditLogs(
    filters: AuditLogFilters = {},
    sort: AuditLogSort = {},
    pagination: AuditLogPagination = {}
  ) {
    const { page = 1, limit = 20 } = pagination
    const { sortBy = 'createdAt', sortOrder = 'desc' } = sort
    const safeLimit = Math.min(limit, 100) // Максимум 100 записей

    const query = AuditLog.query().preload('user', (userQuery) => {
      userQuery.select(['id', 'email', 'fullName'])
    })
    this.applyFilters(query, filters)
    this.applySorting(query, sortBy, sortOrder)
    const auditLogs = await query.paginate(page, safeLimit)

    return {
      data: auditLogs.all().map((log) => this.formatAuditLog(log)),
      meta: {
        total: auditLogs.total,
        perPage: auditLogs.perPage,
        currentPage: auditLogs.currentPage,
        lastPage: auditLogs.lastPage,
        firstPage: auditLogs.firstPage,
        hasNextPage: auditLogs.currentPage < auditLogs.lastPage,
        hasPrevPage: auditLogs.currentPage > 1,
      },
    }
  }

  async getAuditLogById(id: number) {
    const auditLog = await AuditLog.query()
      .where('id', id)
      .preload('user', (userQuery) => {
        userQuery.select(['id', 'email', 'fullName'])
      })
      .firstOrFail()

    return this.formatAuditLog(auditLog)
  }

  async getStats(period: 'day' | 'week' | 'month' = 'day'): Promise<AuditLogStats> {
    const dateFrom = this.getPeriodStartDate(period)

    const [totalLogs, infoLogs, warningLogs, errorLogs, periodLogs, topActions, topUsers] =
      await Promise.all([
        this.getTotalCount(),
        this.getCountByType('info'),
        this.getCountByType('warning'),
        this.getCountByType('error'),
        this.getCountFromDate(dateFrom),
        this.getTopActions(5),
        this.getTopUsers(5),
      ])

    return {
      totals: {
        total: totalLogs,
        info: infoLogs,
        warning: warningLogs,
        error: errorLogs,
        period: periodLogs,
      },
      topActions,
      topUsers,
    }
  }

  async getAvailableActions(): Promise<string[]> {
    const actions = await AuditLog.query()
      .select('action')
      .distinct('action')
      .orderBy('action', 'asc')

    return actions.map((item) => item.action)
  }

  private applyFilters(query: any, filters: AuditLogFilters) {
    const { type, action, userId, search, dateFrom, dateTo } = filters

    if (type && ['info', 'warning', 'error'].includes(type)) {
      query.where('type', type)
    }

    if (action) {
      query.where('action', 'ilike', `%${action}%`)
    }

    if (userId) {
      query.where('userId', userId)
    }

    if (dateFrom) {
      query.where('createdAt', '>=', DateTime.fromISO(dateFrom).startOf('day').toSQL()!)
    }

    if (dateTo) {
      query.where('createdAt', '<=', DateTime.fromISO(dateTo).endOf('day').toSQL()!)
    }

    if (search && search.trim()) {
      query.where((builder: any) => {
        builder
          .where('action', 'ilike', `%${search}%`)
          .orWhere('ip', 'ilike', `%${search}%`)
          .orWhereHas('user', (userBuilder: any) => {
            userBuilder
              .where('email', 'ilike', `%${search}%`)
              .orWhere('fullName', 'ilike', `%${search}%`)
          })
      })
    }
  }

  private applySorting(query: any, sortBy: string, sortOrder: string) {
    const allowedSortFields = ['createdAt', 'type', 'action', 'userId', 'ip']

    if (allowedSortFields.includes(sortBy)) {
      query.orderBy(sortBy, sortOrder === 'asc' ? 'asc' : 'desc')
    } else {
      query.orderBy('createdAt', 'desc')
    }
  }

  private formatAuditLog(log: AuditLog) {
    // Безопасно сериализуем metadata
    let safeMetadata = null
    try {
      if (log.metadata) {
        safeMetadata = JSON.parse(JSON.stringify(log.metadata))
      }
    } catch (error) {
      safeMetadata = { error: 'Failed to parse metadata' }
    }

    return {
      id: log.id,
      userId: log.userId,
      user: log.user
        ? {
            id: log.user.id,
            email: log.user.email,
            fullName: log.user.fullName,
          }
        : null,
      action: log.action,
      type: log.type,
      ip: log.ip,
      metadata: safeMetadata,
      createdAt: log.createdAt.toISO(),
      formattedDate: log.createdAt.toFormat('dd.MM.yyyy HH:mm:ss'),
    }
  }

  private getPeriodStartDate(period: string): DateTime {
    switch (period) {
      case 'week':
        return DateTime.now().startOf('week')
      case 'month':
        return DateTime.now().startOf('month')
      default:
        return DateTime.now().startOf('day')
    }
  }

  private async getTotalCount(): Promise<number> {
    const result = await AuditLog.query().count('* as total')
    return Number(result[0].$extras.total)
  }

  private async getCountByType(type: string): Promise<number> {
    const result = await AuditLog.query().where('type', type).count('* as total')
    return Number(result[0].$extras.total)
  }

  private async getCountFromDate(dateFrom: DateTime): Promise<number> {
    const result = await AuditLog.query()
      .where('createdAt', '>=', dateFrom.toSQL()!)
      .count('* as total')
    return Number(result[0].$extras.total)
  }

  private async getTopActions(limit: number): Promise<Array<{ action: string; count: number }>> {
    const actions = await AuditLog.query()
      .select('action')
      .count('* as count')
      .groupBy('action')
      .orderBy('count', 'desc')
      .limit(limit)

    return actions.map((item) => ({
      action: item.action,
      count: Number(item.$extras.count),
    }))
  }

  private async getTopUsers(
    limit: number
  ): Promise<Array<{ userId: number; user: any; count: number }>> {
    const users = await AuditLog.query()
      .select('userId')
      .whereNotNull('userId')
      .count('* as count')
      .groupBy('userId')
      .preload('user', (userQuery) => {
        userQuery.select(['id', 'email', 'fullName'])
      })
      .orderBy('count', 'desc')
      .limit(limit)

    return users.map((item) => ({
      userId: item.userId!,
      user: item.user
        ? {
            id: item.user.id,
            email: item.user.email,
            fullName: item.user.fullName,
          }
        : null,
      count: Number(item.$extras.count),
    }))
  }
}
