
# 📦 API Тесты для AdonisJS (v5)

Полное руководство по написанию API-тестов с использованием Japa, supertest и встроенных инструментов AdonisJS.

---

## 🔧 Инструменты и окружение

### 1. **Japa (Test Runner)**
- Используется по умолчанию.
- Позволяет писать unit и functional (интеграционные) тесты.

### 2. **@japa/http-server**
- Для тестирования HTTP-эндпоинтов, включая middleware и guards.

```ts
import { test } from '@japa/runner'
import supertest from 'supertest'
import app from '@adonisjs/core/services/app'

test.group('Auth', () => {
  test('Login should return token', async ({ assert }) => {
    const response = await supertest(app.httpServer).post('/login').send({
      email: 'user@example.com',
      password: 'secret',
    })

    response.assertStatus(200)
    assert.exists(response.body.token)
  })
})
```

### 3. **Factories и Seeds**
- Используй `@adonisjs/lucid` factories для генерации тестовых пользователей, ролей и т.д.

```ts
await UserFactory.merge({ email: 'test@example.com' }).create()
```

---

## ✅ Что тестировать

### 1. **Аутентификация**
- `POST /login` — корректные и некорректные данные.
- `POST /logout` — инвалидировать токен.
- `POST /refresh-token` — только по действующему refresh токену.
- Проверка доступа к защищённым эндпоинтам без/с невалидным токеном.

### 2. **CRUD Users/Roles/Permissions**
- Create / Read / Update / Delete — с разными правами доступа.
- Проверка на уникальность.
- Удаление несуществующего объекта.

### 3. **Права доступа**
- Разделение ролей: админ, пользователь.
- Проверка middleware/guards: `auth:api`, `can:updateUser`.

### 4. **Валидация данных**
- Ошибки валидации.
- Обязательные поля.
- Проверка сообщений об ошибках.

---

## 📐 Структура тестов

```
tests/
├── functional/
│   ├── auth.spec.ts
│   ├── users.spec.ts
│   ├── roles.spec.ts
│   └── permissions.spec.ts
└── unit/
    └── auth_service.spec.ts
```

---

## 🧪 Лайфхаки и практики

### 🧼 Изоляция тестов

```ts
test.group('Users', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
```

### 🤖 Factories everywhere

```ts
const user = await UserFactory.with('roles').create()
```

### 🔐 Утилиты авторизации
- `getAuthToken(user: User)` — получай токен для логина в тестах.

### 🧵 Параллелизация
- Используй `--parallel` при запуске, если БД выдерживает.

### 🧰 Custom Assertions
- `assertUnauthorized(res)` — не дублируй `res.status === 401`.

---

## 🧩 Расширения

- **@japa/plugin-snapshot** — снапшоты респонсов.
- **@japa/plugin-benchmarker** — performance-тесты.
- **Mocking**:
  - `mock-req-res` — для подмены зависимостей.

---

## 📄 Пример: `auth.spec.ts`

```ts
import { test } from '@japa/runner'
import supertest from 'supertest'
import app from '@adonisjs/core/services/app'
import { UserFactory } from 'Database/factories'

test.group('Auth', () => {
  test('should return token on correct login', async ({ assert }) => {
    const user = await UserFactory.merge({ password: 'secret' }).create()

    const response = await supertest(app.httpServer)
      .post('/login')
      .send({ email: user.email, password: 'secret' })

    response.assertStatus(200)
    assert.exists(response.body.token)
  })

  test('should fail login with wrong credentials', async () => {
    const response = await supertest(app.httpServer)
      .post('/login')
      .send({ email: 'nonexistent@example.com', password: 'badpass' })

    response.assertStatus(401)
  })
})
```

---

## 🐳 Запуск тестов через Docker

Для запуска тестов в изолированной среде используется Docker:

```bash
# Очистка предыдущих данных (если нужно)
docker compose -f docker-compose.yaml -f docker-compose.test.yaml down -v

# Запуск всех тестов в Docker с тестовой БД
docker compose -f docker-compose.yaml -f docker-compose.test.yaml up --abort-on-container-exit --exit-code-from server_test

# Команда запускает:
# 1. postgres_adonis_test - отдельная тестовая БД
# 2. Миграции в тестовой БД
# 3. Все тесты с NODE_ENV=test
# 4. Автоматическое завершение после тестов
```

**Преимущества Docker тестов:**
- Полная изоляция от локальной среды
- Отдельная тестовая БД (postgres_adonis_test)
- Автоматическая настройка окружения
- Воспроизводимость результатов

---

## 📌 В целом

| Практика                         | Почему важна                                          |
|----------------------------------|--------------------------------------------------------|
| Использовать транзакции          | Изоляция состояния между тестами                      |
| Проверять статус и тело ответа   | Ошибки часто бывают в структуре ответа                |
| Делать минимальные фабрики       | Не создавать всего юзера с ролями, если не нужно      |
| Избегать внешних зависимостей    | Не делать реальные запросы к внешним API в тестах     |
| Покрытие ошибок и edge-case'ов   | Проблемы чаще всего именно там                        |
