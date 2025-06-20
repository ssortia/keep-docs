import path from 'node:path'
import url from 'node:url'

export default {
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../',
  title: 'AdonisJS Next.js Template API',
  version: '1.0.0',
  description: 'API documentation for AdonisJS Next.js Template',
  tagIndex: 1,
  info: {
    title: 'AdonisJS Next.js Template API',
    version: '1.0.0',
    description: 'Полнофункциональное API для управления пользователями, ролями и разрешениями',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  snakeCase: true,
  debug: false,
  ignore: ['/swagger', '/docs', '/health'],
  preferredPutPatch: 'PUT',
  common: {
    parameters: {
      id: {
        in: 'path',
        name: 'id',
        required: true,
        schema: {
          type: 'integer',
          example: 1,
        },
        description: 'Уникальный идентификатор записи',
      },
      page: {
        in: 'query',
        name: 'page',
        required: false,
        schema: {
          type: 'integer',
          default: 1,
          minimum: 1,
        },
        description: 'Номер страницы для пагинации',
      },
      limit: {
        in: 'query',
        name: 'limit',
        required: false,
        schema: {
          type: 'integer',
          default: 10,
          minimum: 1,
          maximum: 100,
        },
        description: 'Количество записей на странице',
      },
    },
    headers: {},
  },
  tags: [
    {
      name: 'Auth',
      description: 'Операции аутентификации и авторизации',
    },
    {
      name: 'Users',
      description: 'Управление пользователями системы',
    },
    {
      name: 'Roles',
      description: 'Управление ролями пользователей',
    },
    {
      name: 'Permissions',
      description: 'Управление разрешениями системы',
    },
  ],
  authMiddlewares: ['auth'],
  defaultSecurityScheme: 'BearerAuth',
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Введите токен доступа в формате: Bearer {token}',
    },
  },
  persistAuthorization: true,
  showFullPath: false,
}
