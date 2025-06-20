import ResourceController from '#controllers/resource_controller'
import User from '#models/user'
import { createUserValidator, updateUserValidator } from '#validators/user_validator'
import { inject } from '@adonisjs/core'
import { ConstraintException } from '#exceptions/business_exceptions'

/**
 * @tag Users
 */
@inject()
export default class UsersController extends ResourceController<typeof User> {
  protected model = User

  /**
   * @index
   * @tag Users
   * @summary Получить список пользователей
   * @description Возвращает пагинированный список пользователей с их ролями. Поддерживает поиск по имени, email и названию роли
   * @paramQuery page - Номер страницы - @default(1) @example(1)
   * @paramQuery limit - Количество записей на странице (макс. 100) - @default(20) @example(20)
   * @paramQuery search - Поиск по имени, email или роли - @example(John Doe)
   * @security BearerAuth
   * @responseBody 200 - {"data": [{"id": 1, "fullName": "John Doe", "email": "john@example.com", "roleId": 2, "blocked": false, "role": {"id": 2, "name": "user", "description": "Обычный пользователь"}, "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z"}], "meta": {"total": 50, "perPage": 20, "currentPage": 1, "lastPage": 3}}
   * @responseBody 400 - {"message": "Failed to fetch records", "error": "Database error"}
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   * @responseBody 403 - {"message": "Недостаточно прав доступа", "required": {"permissions": ["users.view"], "mode": "all"}}
   */

  /**
   * @store
   * @tag Users
   * @summary Создать нового пользователя
   * @description Создает нового пользователя с указанной ролью. По умолчанию назначается роль 'user'
   * @requestBody {"fullName": "John Doe", "email": "john@example.com", "password": "password123", "roleId": 2, "blocked": false}
   * @security BearerAuth
   * @responseBody 201 - {"id": 1, "fullName": "John Doe", "email": "john@example.com", "roleId": 2, "blocked": false, "role": {"id": 2, "name": "user", "description": "Обычный пользователь"}, "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z"}
   * @responseBody 400 - {"message": "Failed to create record", "error": "Validation error details"}
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   * @responseBody 403 - {"message": "Недостаточно прав доступа", "required": {"permissions": ["users.create"], "mode": "all"}}
   * @responseBody 422 - {"message": "Validation failed", "code": "E_VALIDATION_ERROR", "status": 422, "errors": [{"message": "The email field must be a valid email address", "rule": "email", "field": "email"}]}
   */

  /**
   * @show
   * @tag Users
   * @summary Получить пользователя по ID
   * @description Возвращает информацию о пользователе с его ролью
   * @paramPath id - Уникальный идентификатор пользователя - @example(1)
   * @security BearerAuth
   * @responseBody 200 - {"id": 1, "fullName": "John Doe", "email": "john@example.com", "roleId": 2, "blocked": false, "role": {"id": 2, "name": "user", "description": "Обычный пользователь"}, "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z"}
   * @responseBody 404 - {"message": "Record not found", "error": "Row not found"}
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   * @responseBody 403 - {"message": "Недостаточно прав доступа", "required": {"permissions": ["users.view"], "mode": "all"}}
   */

  /**
   * @update
   * @tag Users
   * @summary Обновить пользователя
   * @description Обновляет информацию о пользователе. Пароль не обновляется через этот endpoint
   * @paramPath id - Уникальный идентификатор пользователя - @example(1)
   * @requestBody {"fullName": "Jane Doe", "email": "jane@example.com", "roleId": 3, "blocked": true}
   * @security BearerAuth
   * @responseBody 200 - {"id": 1, "fullName": "Jane Doe", "email": "jane@example.com", "roleId": 3, "blocked": true, "role": {"id": 3, "name": "admin", "description": "Администратор"}, "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T01:00:00.000Z"}
   * @responseBody 404 - {"message": "Record not found", "error": "Row not found"}
   * @responseBody 400 - {"message": "Failed to update record", "error": "Validation error details"}
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   * @responseBody 403 - {"message": "Недостаточно прав доступа", "required": {"permissions": ["users.edit"], "mode": "all"}}
   * @responseBody 422 - {"message": "Validation failed", "code": "E_VALIDATION_ERROR", "status": 422, "errors": [{"message": "The email field must be a valid email address", "rule": "email", "field": "email"}]}
   */

  /**
   * @destroy
   * @tag Users
   * @summary Удалить пользователя
   * @description Полностью удаляет пользователя из системы. Операция необратима
   * @paramPath id - Уникальный идентификатор пользователя - @example(1)
   * @security BearerAuth
   * @responseBody 204 - ""
   * @responseBody 404 - {"message": "Record not found", "error": "Row not found"}
   * @responseBody 400 - {"message": "Failed to delete record", "error": "Database constraint violation"}
   * @responseBody 401 - {"message": "Требуется аутентификация"}
   * @responseBody 403 - {"message": "Недостаточно прав доступа", "required": {"permissions": ["users.delete"], "mode": "all"}}
   */

  protected applyPreloads(query: any) {
    return query.preload('role')
  }

  protected applySearch(query: any, search: string) {
    return query.where((builder: any) => {
      builder
        .whereILike('full_name', `%${search}%`)
        .orWhereILike('email', `%${search}%`)
        .orWhereHas('role', (roleBuilder: any) => {
          roleBuilder.whereILike('name', `%${search}%`)
        })
    })
  }

  protected async validateStoreData(request: any) {
    return request.validateUsing(createUserValidator)
  }

  protected async validateUpdateData(request: any) {
    return request.validateUsing(updateUserValidator)
  }

  /**
   * Проверка уникальности при создании записи
   */
  protected async validateUniqueFieldForCreate(data: any) {
    const existingRecord = await this.model.findBy('email', data.email)

    if (existingRecord) {
      throw new ConstraintException('Пользователь с таким email уже существует')
    }
  }

  /**
   * Проверка уникальности при обновлении записи
   */
  protected async validateUniqueFieldForUpdate(updateData: any) {
    const duplicateRecord = await this.model
      .query()
      .where('email', updateData.email)
      .whereNot('id', updateData.id)
      .first()

    if (duplicateRecord) {
      throw new ConstraintException('Пользователь с таким email уже существует')
    }
  }
}
