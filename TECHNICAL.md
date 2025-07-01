# Keep Docs - Техническая документация

## Оглавление
- [Архитектура проекта](#архитектура-проекта)
- [Технологический стек](#технологический-стек)
- [API документация](#api-документация)
- [Модели данных](#модели-данных)
- [Система схем](#система-схем)
- [Интеграция Keep Docs UI](#интеграция-keep-docs-ui)
- [Развертывание](#развертывание)

## Архитектура проекта

Keep Docs построен как монорепозиторий с микросервисной архитектурой:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
├─────────────────────┬─────────────────────┬─────────────────┤
│   Admin Panel       │   Keep Docs UI      │  External Apps  │
│   (Next.js)         │   (React Component) │                 │
└─────────────────────┴─────────────────────┴─────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                       │
├─────────────────────┬─────────────────────┬─────────────────┤
│   Admin API         │   Schema API        │   Proxy API     │
│   /api/admin/*      │   /api/schema/*     │   /api/proxy/*  │
└─────────────────────┴─────────────────────┴─────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Business Logic                          │
├─────────────────────┬─────────────────────┬─────────────────┤
│   User Management   │   Document Service  │ File Processing │
│   Auth & RBAC       │   Version Control   │ Image/PDF       │
└─────────────────────┴─────────────────────┴─────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
├─────────────────────┬─────────────────────┬─────────────────┤
│   PostgreSQL        │   File Storage      │   Audit Logs    │
│   (Metadata)        │   (Local/S3)        │   (Database)    │
└─────────────────────┴─────────────────────┴─────────────────┘
```

### Основные компоненты

#### Backend (AdonisJS)
- **API Gateway**: Маршрутизация запросов к различным сервисам
- **Auth Service**: JWT + OAuth авторизация с ролевой моделью
- **Document Service**: Управление документами и версиями
- **File Processing**: Автоматическая обработка загружаемых файлов
- **Schema System**: Гибкая система доступа к документам через схемы

#### Frontend Applications
- **Admin Panel**: Управление пользователями, ролями, системой
- **Keep Docs UI**: Переиспользуемый React компонент для интеграции

#### Infrastructure
- **PostgreSQL**: Основная БД для метаданных
- **File Storage**: Локальное хранилище или S3 для файлов
- **GraphicsMagick**: Обработка изображений и конвертация PDF

## Технологический стек

### Backend
```yaml
Framework: AdonisJS 6.x
Language: TypeScript
Database: PostgreSQL 15+
ORM: Lucid (встроенный в AdonisJS)
Authentication: JWT + OAuth 2.0
File Processing: GraphicsMagick, PDF2pic
Validation: VineJS
Testing: Japa
Documentation: Swagger/OpenAPI
```

### Frontend
```yaml
Admin Panel:
  Framework: Next.js 15 (App Router)
  Language: TypeScript
  UI Library: Ant Design
  Forms: React Hook Form + Zod
  Themes: Dark/Light mode

Keep Docs UI:
  Framework: React 18+
  Language: TypeScript
  Build: Rollup
  Styling: CSS Modules
```

### DevOps
```yaml
Monorepo: Turborepo
Package Manager: npm workspaces
Containerization: Docker + Docker Compose
CI/CD: GitHub Actions
Code Quality: ESLint + Prettier
Environment: .env файлы
```

## API документация

### Базовые URL
- **Production**: `https://your-domain.com/api`
- **Development**: `http://localhost:3333/api`
- **Swagger UI**: `http://localhost:3333/docs`

### Аутентификация

#### JWT токены
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... },
  "expires_at": "2024-12-31T23:59:59.000Z"
}
```

#### Schema токены
```bash
# Генерация токена для доступа к схемам
node ace generate:schema-token user@example.com client-name --schemas schema1,schema2 --create-client
```

### Основные эндпоинты

#### Управление пользователями
```http
GET    /api/users              # Список пользователей
POST   /api/users              # Создание пользователя
GET    /api/users/:id          # Получение пользователя
PUT    /api/users/:id          # Обновление пользователя
DELETE /api/users/:id          # Удаление пользователя
```

#### Управление документами
```http
GET    /api/dossiers           # Список досье
POST   /api/dossiers           # Создание досье
GET    /api/dossiers/:id       # Получение досье

GET    /api/documents          # Список документов
POST   /api/documents          # Создание документа
PUT    /api/documents/:id      # Обновление документа

GET    /api/versions           # Список версий
POST   /api/versions           # Создание версии
PUT    /api/versions/:id/current # Установка текущей версии
```

#### Schema API
```http
GET    /api/schema/:schema/dossiers/:id     # Получение досье по схеме
POST   /api/schema/:schema/documents        # Создание документа
GET    /api/schema/:schema/documents/:id    # Получение документа
```

#### Proxy API
```http
GET    /api/proxy/*            # Проксирование запросов
POST   /api/proxy/*            # с авторизацией по Bearer токену
```

### Коды ответов
```yaml
200: OK - Успешный запрос
201: Created - Ресурс создан
204: No Content - Успешное удаление
400: Bad Request - Ошибка валидации
401: Unauthorized - Не авторизован
403: Forbidden - Нет прав доступа
404: Not Found - Ресурс не найден
422: Unprocessable Entity - Ошибка бизнес-логики
500: Internal Server Error - Серверная ошибка
```

## Модели данных

### Схема базы данных

```sql
-- Пользователи и права доступа
users (id, email, full_name, password, role_id, blocked, is_email_verified)
roles (id, name, description)
permissions (id, name, description)
role_permissions (role_id, permission_id)

-- API клиенты для схем
api_clients (id, name, description, allowed_schemas, active, created_by)
access_tokens (id, user_id, name, hash, abilities, expires_at)

-- Система документов
dossiers (id, name, external_id, schema, created_by)
documents (id, dossier_id, type, name, current_version_id, created_by)
versions (id, document_id, version_number, created_by, deleted_at)
files (id, version_id, filename, original_name, mime_type, size, path)

-- Аудит
audit_logs (id, user_id, action, resource_type, resource_id, old_values, new_values)
```

### Основные модели

#### User Model
```typescript
class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column()
  declare fullName: string | null

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare roleId: number | null

  @column()
  declare blocked: boolean

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  // Методы для проверки прав
  hasRole(roleName: string): boolean
  async hasPermission(permission: string): Promise<boolean>
  async hasAllPermissions(permissions: string[]): Promise<boolean>
}
```

#### Document Model
```typescript
class Document extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare dossierId: number

  @column()
  declare type: string

  @column()
  declare name: string

  @column()
  declare currentVersionId: number | null

  @belongsTo(() => Dossier)
  declare dossier: BelongsTo<typeof Dossier>

  @hasMany(() => Version)
  declare versions: HasMany<typeof Version>

  @belongsTo(() => Version, { foreignKey: 'currentVersionId' })
  declare currentVersion: BelongsTo<typeof Version>
}
```

#### Version Model
```typescript
class Version extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare documentId: number

  @column()
  declare versionNumber: number

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => Document)
  declare document: BelongsTo<typeof Document>

  @hasMany(() => File)
  declare files: HasMany<typeof File>
}
```

## Система схем

Схемы позволяют организовать доступ к документам по типам и интегрировать Keep Docs с внешними системами.

### Создание схемы

1. **Определение схемы** в `apps/server/app/scheme/`:
```typescript
// example.ts
export default {
  documents: [
    {
      type: 'passport',
      name: 'Паспорт',
      required: {
        statusCode: ['CREATION'],
      },
      access: {
        show: '*',
        editable: {
          statusCode: ['CREATION', 'CREATED'],
        },
      },
    },
    {
      type: 'inn',
      name: 'ИНН',
    }
  ],
}
```

2. **Создание API клиента**:
```typescript
const client = await ApiClient.create({
  name: 'my-app',
  description: 'Мое приложение',
  allowedSchemas: ['example'],
  createdBy: userId,
  active: true,
})
```

3. **Генерация токена**:
```bash
node ace generate:schema-token user@example.com my-app --schemas example --create-client
```

### Использование схемы

#### В API запросах
```http
GET /api/schema/example/dossiers/123
Authorization: Bearer <schema-token>
```

#### В Keep Docs UI
```jsx
<KeepDocs
  apiUrl="http://localhost:3333"
  token="<schema-token>"
  schema="example"
  dossierId="123"
/>
```

## Интеграция Keep Docs UI

### Установка
```bash
npm install @keep-docs/ui
```

### Базовое использование
```jsx
import { KeepDocs } from '@keep-docs/ui'
import '@keep-docs/ui/dist/style.css'

function MyApp() {
  return (
    <KeepDocs
      apiUrl="http://localhost:3333"
      token="your-schema-token"
      schema="your-schema"
      dossierId="dossier-id"
      onDocumentUpload={(document) => console.log('Uploaded:', document)}
      onDocumentDelete={(documentId) => console.log('Deleted:', documentId)}
    />
  )
}
```

### Продвинутая конфигурация
```jsx
<KeepDocs
  // Обязательные параметры
  apiUrl="http://localhost:3333"
  token="your-schema-token"
  schema="your-schema"
  dossierId="dossier-id"
  
  // Опциональные параметры
  uploadMode="multiple" // single | multiple
  allowedFileTypes={['image/*', 'application/pdf']}
  maxFileSize={10 * 1024 * 1024} // 10MB
  
  // Callbacks
  onDocumentUpload={(document) => {}}
  onDocumentDelete={(documentId) => {}}
  onVersionChange={(versionId) => {}}
  onError={(error) => {}}
  
  // UI настройки
  theme="light" // light | dark | auto
  locale="ru" // ru | en
  showPreview={true}
  showVersionHistory={true}
/>
```

### Стилизация
```css
/* Переопределение стилей */
.keep-docs {
  --primary-color: #1890ff;
  --border-radius: 6px;
  --font-family: 'Inter', sans-serif;
}

.keep-docs .document-item {
  border: 1px solid var(--border-color);
}
```

## Развертывание

### Development

1. **Клонирование и установка**:
```bash
git clone <repository-url>
cd keep-docs
npm install
```

2. **Настройка окружения**:
```bash
cp apps/server/.env.example apps/server/.env
# Настройте переменные в .env
```

3. **Запуск с Docker**:
```bash
docker compose up -d
docker compose exec server node ace migration:run
docker compose exec server node ace db:seed
```

4. **Локальный запуск**:
```bash
# Только PostgreSQL
docker compose up postgres -d

# Сборка и миграции
cd apps/server
npm run build
node ace migration:run
node ace db:seed

# Запуск всех сервисов
npm run dev
```

### Production

#### Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: keep_docs
      POSTGRES_USER: keep_docs
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  server:
    build:
      context: .
      dockerfile: apps/server/Dockerfile
      target: production
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://keep_docs:${DB_PASSWORD}@postgres:5432/keep_docs
    volumes:
      - ./storage:/app/storage
    depends_on:
      - postgres

  client:
    build:
      context: .
      dockerfile: apps/client/Dockerfile
      target: production
    environment:
      NEXT_PUBLIC_API_URL: ${API_URL}

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
```

#### Переменные окружения Production
```bash
# .env.production
NODE_ENV=production
APP_KEY=your-production-app-key
HOST=0.0.0.0
PORT=3333

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=keep_docs
DB_PASSWORD=your-secure-password
DB_DATABASE=keep_docs

# URLs
CLIENT_URL=https://your-domain.com

# Mail (опционально)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# OAuth (опционально)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Мониторинг

#### Health Check эндпоинты
```http
GET /health              # Общее состояние
GET /health/database     # Состояние БД
GET /health/storage      # Состояние файлового хранилища
```

#### Логирование
```typescript
// Настройка в config/logger.ts
export default defineConfig({
  default: 'app',
  loggers: {
    app: {
      enabled: true,
      level: env.get('LOG_LEVEL'),
      transport: {
        targets: [
          {
            target: 'pino-pretty',
            level: 'info',
            options: {},
          },
          {
            target: 'pino/file',
            level: 'error',
            options: {
              destination: './storage/logs/app.log',
            },
          },
        ],
      },
    },
  },
})
```

#### Системная информация
```http
GET /api/system/info
Authorization: Bearer <admin-token>

Response:
{
  "version": "1.0.0",
  "uptime": 86400,
  "memory": {
    "used": "150MB",
    "total": "512MB"
  },
  "database": {
    "status": "connected",
    "users": 25,
    "documents": 1205
  },
  "storage": {
    "totalSize": "2.5GB",
    "filesCount": 3421
  }
}
```

### Резервное копирование

#### База данных
```bash
# Создание бэкапа
docker compose exec postgres pg_dump -U keep_docs keep_docs > backup-$(date +%Y%m%d).sql

# Восстановление
docker compose exec -i postgres psql -U keep_docs keep_docs < backup-20241225.sql
```

#### Файлы
```bash
# Создание архива файлов
tar -czf storage-backup-$(date +%Y%m%d).tar.gz apps/server/storage/uploads/

# Восстановление
tar -xzf storage-backup-20241225.tar.gz
```

### Безопасность

#### Основные рекомендации
1. **Регулярно обновляйте зависимости**
2. **Используйте HTTPS в production**
3. **Настройте firewall**
4. **Ограничьте доступ к БД**
5. **Регулярно делайте бэкапы**
6. **Мониторьте логи безопасности**

#### Настройка CORS
```typescript
// config/cors.ts
export default defineConfig({
  enabled: true,
  origin: [
    'https://your-domain.com',
    'https://admin.your-domain.com',
  ],
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})
```

#### Rate Limiting
```typescript
// В middleware
export default class RateLimitMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Реализация rate limiting
    const key = `rate_limit:${ctx.request.ip()}`
    const requests = await redis.get(key) || 0
    
    if (requests > 100) {
      throw new TooManyRequestsException('Rate limit exceeded')
    }
    
    await redis.setex(key, 3600, requests + 1)
    await next()
  }
}
```

---

**Документация актуальна для версии Keep Docs 1.0.0**
**Последнее обновление: 2025-01-01**