import ResourceController from '#controllers/resource_controller'
import Role from '#models/role'
import type { HttpContext } from '@adonisjs/core/http'
import { RoleService } from '#services/role_service'
import { inject } from '@adonisjs/core'
import { createRoleValidator, updateRoleValidator } from '#validators/role_validator'

/**
 * @tag Roles
 */
@inject()
export default class RolesController extends ResourceController<typeof Role> {
  protected model = Role

  constructor(private roleService: RoleService) {
    super()
  }

  /**
   * @index
   * @tag Roles
   * @summary Получить список ролей
   * @description Возвращает пагинированный список всех ролей с их разрешениями. Поддерживает поиск по названию и описанию
   * @paramQuery page - Номер страницы - @default(1) @example(1)
   * @paramQuery limit - Количество записей на странице (макс. 100) - @default(20) @example(20)
   * @paramQuery search - Поиск по названию или описанию - @example(admin)
   * @security BearerAuth
   * @responseBody 200 - {"data": [{"id": 1, "name": "admin", "description": "Администратор", "permissions": [{"id": 1, "name": "users.view", "description": "Просмотр пользователей"}], "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z"}], "meta": {"total": 3, "perPage": 20, "currentPage": 1, "lastPage": 1}}
   * @responseBody 400 - {"message": "Failed to fetch records", "error": "Database error"}
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   * @responseBody 403 - {"message": "Недостаточно прав доступа", "required": {"permissions": ["roles.view"], "mode": "all"}}
   */

  /**
   * @show
   * @tag Roles
   * @summary Получить роль по ID
   * @description Возвращает детальную информацию о роли со всеми связанными разрешениями
   * @paramPath id - Уникальный идентификатор роли - @example(1)
   * @security BearerAuth
   * @responseBody 200 - {"id": 1, "name": "admin", "description": "Администратор", "permissions": [{"id": 1, "name": "users.view", "description": "Просмотр пользователей"}, {"id": 2, "name": "users.create", "description": "Создание пользователей"}], "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z"}
   * @responseBody 404 - {"message": "Record not found", "error": "Row not found"}
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   * @responseBody 403 - {"message": "Недостаточно прав доступа", "required": {"permissions": ["roles.view"], "mode": "all"}}
   */

  /**
   * @update
   * @tag Roles
   * @summary Обновить роль
   * @description Обновляет название, описание и список разрешений роли. Можно полностью заменить список разрешений
   * @paramPath id - Уникальный идентификатор роли - @example(1)
   * @requestBody {"name": "super-admin", "description": "Супер-администратор", "permissions": [1, 2, 3, 4, 5]}
   * @security BearerAuth
   * @responseBody 200 - {"id": 1, "name": "super-admin", "description": "Супер-администратор", "permissions": [{"id": 1, "name": "users.view", "description": "Просмотр пользователей"}], "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T01:00:00.000Z"}
   * @responseBody 404 - {"message": "Record not found", "error": "Row not found"}
   * @responseBody 400 - {"message": "Failed to update record", "error": "Validation error details"}
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   * @responseBody 403 - {"message": "Недостаточно прав доступа", "required": {"permissions": ["roles.edit"], "mode": "all"}}
   * @responseBody 422 - {"message": "Validation failed", "code": "E_VALIDATION_ERROR", "status": 422, "errors": [{"message": "The name field must be at least 2 characters", "rule": "minLength", "field": "name"}]}
   */

  /**
   * @destroy
   * @tag Roles
   * @summary Удалить роль
   * @description Полностью удаляет роль со всеми связями. Внимание: пользователи останутся без роли
   * @paramPath id - Уникальный идентификатор роли - @example(1)
   * @security BearerAuth
   * @responseBody 204 - ""
   * @responseBody 404 - {"message": "Record not found", "error": "Row not found"}
   * @responseBody 400 - {"message": "Failed to delete record", "error": "Foreign key constraint violation"}
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   * @responseBody 403 - {"message": "Недостаточно прав доступа", "required": {"permissions": ["roles.delete"], "mode": "all"}}
   */

  /**
   * @store
   * @tag Roles
   * @summary Создать новую роль
   * @description Создает новую роль с указанными разрешениями. Можно создать роль без разрешений
   * @requestBody {"name": "moderator", "description": "Модератор сайта", "permissions": [1, 2, 5]}
   * @security BearerAuth
   * @responseBody 201 - {"id": 4, "name": "moderator", "description": "Модератор сайта", "permissions": [{"id": 1, "name": "users.view", "description": "Просмотр пользователей"}], "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z"}
   * @responseBody 400 - {"message": "Failed to create record", "error": "Validation error details"}
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   * @responseBody 403 - {"message": "Недостаточно прав доступа", "required": {"permissions": ["roles.create"], "mode": "all"}}
   * @responseBody 422 - {"message": "Validation failed", "code": "E_VALIDATION_ERROR", "status": 422, "errors": [{"message": "The name field must be at least 2 characters", "rule": "minLength", "field": "name"}]}
   */
  async store({ request, response }: HttpContext) {
    const data = await this.validateStoreData(request)
    await this.validateUniqueFieldForCreate(data)

    const role = await this.roleService.createRole(data)

    return response.created(role)
  }

  async update({ params, request, response }: HttpContext) {
    const data = await this.validateUpdateData(request)
    await this.validateUniqueFieldForUpdate({ id: params.id, ...data })
    const role = await this.roleService.updateRole(Number(params.id), data)

    return response.ok(role)
  }

  async destroy({ params, response }: HttpContext) {
    await this.roleService.deleteRole(Number(params.id))
    return response.noContent()
  }

  protected applyPreloads(query: any) {
    return query.preload('permissions')
  }

  protected applySearch(query: any, search: string) {
    return query.where((builder: any) => {
      builder.whereILike('name', `%${search}%`).orWhereILike('description', `%${search}%`)
    })
  }

  protected async validateStoreData(request: any) {
    return request.validateUsing(createRoleValidator)
  }

  protected async validateUpdateData(request: any) {
    return request.validateUsing(updateRoleValidator)
  }
}
