import path from 'node:path'
import url from 'node:url'

export default {
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../',
  title: 'Keep Docs System',
  version: '1.0.0',
  description: 'API documentation for Keep Docs',
  tagIndex: 1,
  info: {
    title: 'Keep Docs API',
    version: '1.0.0',
    description: 'API для хранения документов',
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
    {
      name: 'Dossiers',
      description: 'Создание и просмотр досье с документами',
    },
    {
      name: 'Documents',
      description: 'Загрузка, скачивание и управление документами',
    },
    {
      name: 'Document Files',
      description: 'Работа с отдельными страницами документов',
    },
    {
      name: 'Versions',
      description: 'Управление версиями документов',
    },
    {
      name: 'Schemas',
      description: 'Получение конфигурации схем документооборота',
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
