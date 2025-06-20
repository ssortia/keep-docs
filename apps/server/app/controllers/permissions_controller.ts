import ResourceController from '#controllers/resource_controller'
import Permission from '#models/permission'

/**
 * @tag Permissions
 */
export default class PermissionsController extends ResourceController<typeof Permission> {
  protected model = Permission

  /**
   * @index
   * @tag Permissions
   * @summary Получить список разрешений
   * @description Возвращает пагинированный список всех доступных разрешений. Поддерживает поиск по названию и описанию
   * @paramQuery page - Номер страницы - @default(1) @example(1)
   * @paramQuery limit - Количество записей на странице (макс. 100) - @default(20) @example(20)
   * @paramQuery search - Поиск по названию или описанию - @example(users.view)
   * @security BearerAuth
   * @responseBody 200 - {"data": [{"id": 1, "name": "users.view", "description": "Просмотр пользователей", "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z"}], "meta": {"total": 20, "perPage": 20, "currentPage": 1, "lastPage": 1}}
   * @responseBody 400 - {"message": "Failed to fetch records", "error": "Database error"}
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   * @responseBody 403 - {"message": "Недостаточно прав доступа", "required": {"permissions": ["permissions.view"], "mode": "all"}}
   */

  /**
   * @store
   * @tag Permissions
   * @summary Создать новое разрешение
   * @description Создает новое разрешение с уникальным именем. Имя должно следовать формату 'resource.action'
   * @requestBody {"name": "posts.create", "description": "Создание постов"}
   * @security BearerAuth
   * @responseBody 201 - {"id": 15, "name": "posts.create", "description": "Создание постов", "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z"}
   * @responseBody 400 - {"message": "Failed to create record", "error": "Validation error details"}
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   * @responseBody 403 - {"message": "Недостаточно прав доступа", "required": {"permissions": ["permissions.create"], "mode": "all"}}
   * @responseBody 422 - {"message": "Validation failed", "code": "E_VALIDATION_ERROR", "status": 422, "errors": [{"message": "The name field must match the pattern resource.action", "rule": "regex", "field": "name"}]}
   */

  /**
   * @show
   * @tag Permissions
   * @summary Получить разрешение по ID
   * @description Возвращает детальную информацию о разрешении
   * @paramPath id - Уникальный идентификатор разрешения - @example(1)
   * @security BearerAuth
   * @responseBody 200 - {"id": 1, "name": "users.view", "description": "Просмотр пользователей", "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z"}
   * @responseBody 404 - {"message": "Record not found", "error": "Row not found"}
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   * @responseBody 403 - {"message": "Недостаточно прав доступа", "required": {"permissions": ["permissions.view"], "mode": "all"}}
   */

  /**
   * @update
   * @tag Permissions
   * @summary Обновить разрешение
   * @description Обновляет название и описание разрешения. Имя должно оставаться уникальным
   * @paramPath id - Уникальный идентификатор разрешения - @example(1)
   * @requestBody {"name": "posts.edit", "description": "Редактирование постов"}
   * @security BearerAuth
   * @responseBody 200 - {"id": 1, "name": "posts.edit", "description": "Редактирование постов", "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T01:00:00.000Z"}
   * @responseBody 404 - {"message": "Record not found", "error": "Row not found"}
   * @responseBody 400 - {"message": "Failed to update record", "error": "Validation error details"}
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   * @responseBody 403 - {"message": "Недостаточно прав доступа", "required": {"permissions": ["permissions.edit"], "mode": "all"}}
   * @responseBody 422 - {"message": "Validation failed", "code": "E_VALIDATION_ERROR", "status": 422, "errors": [{"message": "The name field must match the pattern resource.action", "rule": "regex", "field": "name"}]}
   */

  /**
   * @destroy
   * @tag Permissions
   * @summary Удалить разрешение
   * @description Полностью удаляет разрешение. Внимание: оно будет удалено из всех ролей
   * @paramPath id - Уникальный идентификатор разрешения - @example(1)
   * @security BearerAuth
   * @responseBody 204 - ""
   * @responseBody 404 - {"message": "Record not found", "error": "Row not found"}
   * @responseBody 400 - {"message": "Failed to delete record", "error": "Foreign key constraint violation"}
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   * @responseBody 403 - {"message": "Недостаточно прав доступа", "required": {"permissions": ["permissions.delete"], "mode": "all"}}
   */

  protected applySearch(query: any, search: string) {
    return query.where((builder: any) => {
      builder.whereILike('name', `%${search}%`).orWhereILike('description', `%${search}%`)
    })
  }
}
