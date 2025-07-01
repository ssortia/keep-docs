# Keep Docs

Полнофункциональное решение для управления документами, построенное на **AdonisJS** (backend) и **Next.js** (frontend). Система включает управление пользователями, ролевую модель доступа, загрузку документов с версионированием и API для интеграции с внешними системами.

## 🚀 Features

### Backend (AdonisJS)
- **Управление документами**: Загрузка, версионирование, группировка документов по типам
- **Система досье**: Создание и управление досье с привязкой документов
- **API для схем**: Доступ к документам через схемы с токенизированной авторизацией
- **Proxy API**: Прокси-контроллер для интеграции с внешними системами
- **Обработка файлов**: Поддержка изображений, PDF, архивов с автоматической обработкой
- **Аудит логи**: Полное логирование всех действий в системе
- **Authentication & Authorization**: JWT + OAuth (GitHub) с email верификацией
- **RBAC**: Пользователи, роли и разрешения
- **Database**: PostgreSQL с миграциями и сидерами

### Frontend (Next.js)
- **Admin панель**: Управление пользователями, ролями, разрешениями
- **Просмотр аудит логов**: Отслеживание всех действий в системе
- **Мониторинг системы**: Dashboard с информацией о состоянии системы
- **React 19 + TypeScript**: Современный стек с строгой типизацией
- **Ant Design**: Компоненты UI с поддержкой темной/светлой темы
- **Form Management**: React Hook Form с Zod валидацией
- **Authentication UI**: Полный набор страниц авторизации

### Дополнительные возможности
- **Keep Docs UI**: React компонент для интеграции в другие приложения
- **Schema API**: Гибкая система доступа к документам через схемы
- **File Processing**: Автоматическая обработка изображений и PDF
- **Docker**: Мульти-сервисная среда разработки
- **Turborepo**: Управление монорепозиторием
- **Testing**: Комплексное тестирование API и функциональности

## 📁 Project Structure

```
keep-docs/
├── apps/
│   ├── client/          # Next.js админ панель
│   │   ├── app/         # App Router с админ интерфейсом
│   │   ├── components/  # UI компоненты для управления
│   │   ├── hooks/       # Хуки для работы с API
│   │   └── services/    # Сервисы для API запросов
│   ├── keep-docs-ui/    # React компонент библиотека
│   │   ├── src/         # Исходный код компонентов
│   │   ├── components/  # Компоненты для работы с документами
│   │   ├── hooks/       # Хуки для управления состоянием
│   │   └── styles/      # CSS стили
│   └── server/          # AdonisJS backend
│       ├── app/
│       │   ├── controllers/  # API контроллеры
│       │   ├── models/       # Модели БД (User, Document, Version)
│       │   ├── services/     # Бизнес логика
│       │   ├── middleware/   # Middleware для авторизации
│       │   └── scheme/       # Схемы для API доступа
│       ├── commands/    # CLI команды
│       ├── database/    # Миграции и сидеры
│       └── storage/     # Хранилище файлов
├── docker-compose.yaml  # Среда разработки
└── CLAUDE.md           # Инструкции для разработки
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 22+ and npm
- Docker and Docker Compose
- Git

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd keep-docs
```

### 2. Настройка окружения
Создайте файлы окружения для сервера:

```bash
# Скопируйте пример файла окружения
cp apps/server/.env.example apps/server/.env
```

Настройте переменные окружения:
- `DATABASE_URL` - подключение к PostgreSQL
- `APP_KEY` - ключ приложения

### 3. Запуск с Docker
```bash
# Запуск всех сервисов (PostgreSQL, Server, Client, Swagger UI)
docker compose up

# Или в фоновом режиме
docker compose up -d
```

Сервисы будут доступны по адресам:
- **Admin панель**: http://localhost:3030
- **Backend API**: http://localhost:3333
- **Swagger документация**: http://localhost:3333/docs
- **PostgreSQL**: localhost:5440

### 4. Инициализация БД
```bash
# Запуск миграций и сидеров
docker compose exec server node ace migration:run
docker compose exec server node ace db:seed
```

Сидеры создадут:
- Роли и разрешения
- Тестового администратора (test@mail.ru / 123123)
- Пользователя для API схем с токеном в переменной PROXY_BEARER

### 5. Локальная разработка (альтернатива)
```bash
# Install dependencies
npm install

# Start PostgreSQL only
docker compose up postgres -d

# Run migrations and seeders
cd apps/server
npm run build
node ace migration:run
node ace db:seed

# Start development servers
npm run dev
```

### 6. Запуск тестов
```bash
cd apps/server && node ace test # при запущенном сервере
```

## 📚 Available Scripts

### Root Level
- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all applications
- `npm run lint` - Lint all workspaces
- `npm run test` - Run tests across all apps
- `npm run ace` - Access AdonisJS CLI commands

### Server (AdonisJS)
```bash
cd apps/server

# Development
npm run dev          # Start with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Database
node ace migration:run     # Run migrations
node ace migration:rollback # Rollback migrations
node ace db:seed          # Run database seeders

# Code Quality
npm run lint         # ESLint check
npm run format       # Prettier format
npm run typecheck    # TypeScript check
npm run test         # Run tests
```

### Client (Next.js)
```bash
cd apps/client

# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # ESLint check
npm run format       # Prettier format
```

## 🔧 API Endpoints

### Основные эндпоинты:
- `/api/dossiers/*` - Управление досье
- `/api/documents/*` - Управление документами
- `/api/proxy/*` - Proxy API для внешних систем
- `/api/schema/*` - API для работы со схемами

Полная документация доступна по адресу: http://localhost:3333/docs

## 🔒 Авторизация и права доступа

### Система ролей
- **admin**: Полный доступ к системе
- **manager**: Ограниченные административные права
- **user**: Базовые права пользователя

### Разрешения
- Управление пользователями (просмотр, создание, редактирование, удаление)
- Управление ролями и разрешениями
- Доступ к админ панели

### API токены для схем
```bash
# Генерация токена для доступа к схемам
node ace generate:schema-token <email> <client-name> --schemas <schema1,schema2> --create-client
```

### Middleware защиты
- `auth`: Требует авторизации
- `role`: Требует определенную роль
- `permission`: Требует определенное разрешение
- `schema_access`: Проверяет доступ к схеме по токену

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run server tests only
cd apps/server && npm run test

# Run specific test file
cd apps/server && node ace test tests/functional/auth.spec.ts
```

## 📊 Основные модели

### Пользователи и права
- **User**: Пользователи с авторизацией
- **Role**: Роли для контроля доступа
- **Permission**: Система разрешений
- **AccessToken**: Управление JWT токенами
- **ApiClient**: API клиенты для схем

### Управление документами
- **Dossier**: Досье (контейнеры для документов)
- **Document**: Документы с типами и метаданными
- **Version**: Версии документов
- **File**: Файлы с обработкой и превью
- **AuditLog**: Логи всех действий в системе

## 🎯 Схемы и интеграция

Система поддерживает работу со схемами для интеграции с внешними системами:

1. **Создание схемы**: Определите структуру документов в `apps/server/app/scheme/`
2. **API клиент**: Создайте API клиента с доступом к схемам
3. **Токен доступа**: Получите токен для работы с API
4. **Интеграция**: Используйте Keep Docs UI компонент в своем приложении

### Пример использования Keep Docs UI:
```jsx
import { KeepDocs } from '@keep-docs/ui'

const config = {
  baseUrl: 'http://localhost:3333/api/proxydocs',
  schema: 'example'
};

<KeepDocs
    uuid={uuid}
    config={config}
/>
```

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [AdonisJS Documentation](https://docs.adonisjs.com)
- Check the [Next.js Documentation](https://nextjs.org/docs)
- Open an issue in this repository

---

**Keep Docs - современное решение для управления документами с API интеграцией**
