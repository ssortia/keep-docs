import type { HttpContext } from '@adonisjs/core/http'
import type { BaseModel } from '@adonisjs/lucid/orm'
import { ConstraintException } from '#exceptions/business_exceptions'

export default abstract class ResourceController<Model extends typeof BaseModel> {
  protected abstract model: Model

  /**
   * Display a listing of the resource.
   * GET /resource
   */
  async index({ request, response }: HttpContext) {
    const page = Math.max(1, Number(request.input('page', 1)))
    const limit = Math.min(100, Math.max(1, Number(request.input('limit', 10))))
    const search = request.input('search', '').trim()

    let query = this.model.query()

    query = this.applyPreloads(query)

    if (search) {
      query = this.applySearch(query, search)
    }

    query = this.applyFilters(query, request)
    query = this.applySorting(query, request)

    const records = await query.paginate(page, limit)

    return response.ok(records)
  }

  /**
   * Store a newly created resource in storage.
   * POST /resource
   */
  async store({ request, response }: HttpContext) {
    const data = await this.validateStoreData(request)

    await this.validateUniqueFieldForCreate(data)

    const record = await this.model.create(data)

    return response.created(record)
  }

  /**
   * Display the specified resource.
   * GET /resource/:id
   */
  async show({ params, response }: HttpContext) {
    const record = await this.findRecord(params.id)

    return response.ok(record)
  }

  /**
   * Update the specified resource in storage.
   * PUT/PATCH /resource/:id
   */
  async update({ params, request, response }: HttpContext) {
    const data = await this.validateUpdateData(request)
    const record = await this.findRecord(params.id)

    await this.validateUniqueFieldForUpdate({ id: params.id, ...data })
    record.merge(data)
    await record.save()

    return response.ok(record)
  }

  /**
   * Remove the specified resource from storage.
   * DELETE /resource/:id
   */
  async destroy({ params, response }: HttpContext) {
    const record = await this.findRecord(params.id)

    await record.delete()

    return response.noContent()
  }

  /**
   * Find a single record by ID
   */
  protected async findRecord(id: string | number) {
    let query = this.model.query().where('id', id)
    query = this.applyPreloads(query)
    return query.firstOrFail()
  }

  /**
   * Apply preloads to query (override in child classes)
   */
  protected applyPreloads(query: any) {
    return query
  }

  /**
   * Apply search filters to query (override in child classes)
   */
  protected applySearch(query: any, _search: string) {
    return query
  }

  /**
   * Apply additional filters to query (override in child classes)
   */
  protected applyFilters(query: any, _request: any) {
    return query
  }

  /**
   * Apply sorting to query (override in child classes)
   */
  protected applySorting(query: any, request: any) {
    const sortBy = request.input('sortBy', 'id')
    const sortOrder = request.input('sortOrder', 'desc')

    return query.orderBy(sortBy, sortOrder)
  }

  /**
   * Validate data for store operation (override in child classes)
   */
  protected async validateStoreData(request: any) {
    return request.all()
  }

  /**
   * Validate data for update operation (override in child classes)
   */
  protected async validateUpdateData(request: any) {
    return request.all()
  }

  /**
   * Проверка уникальности при создании записи
   */
  protected async validateUniqueFieldForCreate(data: any) {
    const existingRecord = await this.model.findBy('name', data.name)

    if (existingRecord) {
      throw new ConstraintException('Запись с таким названием уже существует')
    }
  }

  /**
   * Проверка уникальности при обновлении записи
   */
  protected async validateUniqueFieldForUpdate(updateData: any) {
    const duplicateRecord = await this.model
      .query()
      .where('name', updateData.name)
      .where('id', '<>', updateData.id)
      .first()

    if (duplicateRecord) {
      throw new ConstraintException('Запись с таким названием уже существует')
    }
  }
}
