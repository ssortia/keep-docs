# Keep Docs UI

Современная React UI библиотека для работы с сервисом хранения документов. Обеспечивает полноценное управление
документами с поддержкой версионирования, интерактивного просмотра и продвинутой навигации.

## 🚀 Установка

```bash
npm install @keep-docs/ui
```

## 📖 Использование

```tsx
import React from 'react';
import { KeepDocs } from '@keep-docs/ui';
import '@keep-docs/ui/styles/KeepDocs.css';

const config = {
  baseUrl: 'http://localhost:3333/api/proxydocs',
  schema: 'client_dossier'
};

const params = {
  statusCode: 'CREATION',
  userType: 'INDIVIDUAL'
};

const uuid = '550e8400-e29b-41d4-a716-446655440000';

function App() {
  const handleError = (error: string) => {
    console.error('Keep Docs Error:', error);
  };

  const handleInit = (dossier) => {
    console.log('Dossier initialized:', dossier);
  };

  return (
    <KeepDocs
      uuid={uuid}
      config={config}
      params={params}
      onError={handleError}
      onInit={handleInit}
    />
  );
}
```

## 📋 Props

### KeepDocs

| Prop          | Тип                                    | Обязательный | Описание                                |
|---------------|----------------------------------------|--------------|-----------------------------------------|
| `config`      | `DocumentManagerConfig`                | ✅            | Конфигурация подключения к API          |
| `uuid`        | `string`                               | ✅            | UUID досье                              |
| `defaultTab?` | `string`                               | ❌            | Активная вкладка по умолчанию           |
| `params?`     | `{ [key: string]: any }`               | ❌            | Параметры для фильтрации и прав доступа |
| `onError?`    | `(error: string) => void`              | ❌            | Обработчик ошибок                       |
| `onInit?`     | `(dossier: Dossier) => void`           | ❌            | Вызывается после инициализации          |
| `onUpdate?`   | `(document: Document) => void`         | ❌            | Вызывается после загрузки документа     |
| `onRemove?`   | `(type: string, uuid: string) => void` | ❌            | Вызывается после удаления страницы      |

### DocumentManagerConfig

```tsx
interface DocumentManagerConfig {
  baseUrl: string;    // URL прокси-эндпоинта
  schema: string;     // Имя схемы документов
}
```

#### Настройка прокси-сервера

**Важно:** `baseUrl` должен указывать на прокси-эндпоинт, который:

1. **Проксирует запросы** на сервер keep-docs
2. **Автоматически добавляет Bearer токен** для аутентификации
3. **Обрабатывает CORS** если необходимо

**Пример прокси-эндпоинта (Next.js API Route):**

```typescript
// pages/api/proxydocs/[...path].ts
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false, // Отключаем встроенный парсер для multipart/form-data
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path;
  
  // Получаем Bearer токен из сессии/cookies/headers
  const token = req.headers.authorization || await getTokenFromSession(req);
  
  // Подготавливаем headers, исключая host и content-length
  const forwardHeaders = { ...req.headers };
  delete forwardHeaders.host;
  delete forwardHeaders['content-length'];
  
  // Добавляем Authorization header
  forwardHeaders['authorization'] = `Bearer ${token}`;
  
  let body;
  
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // Для multipart/form-data и других типов - передаем raw body
    body = await getRawBody(req);
  }
  
  const response = await fetch(`${process.env.KEEP_DOCS_SERVER_URL}/${pathString}`, {
    method: req.method,
    headers: forwardHeaders,
    body: body,
  });
  
  // Проксируем response headers
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  
  // Возвращаем response как stream для больших файлов
  res.status(response.status);
  
  if (response.body) {
    const reader = response.body.getReader();
    const pump = () => reader.read().then(({ done, value }) => {
      if (done) {
        res.end();
        return;
      }
      res.write(value);
      return pump();
    });
    return pump();
  } else {
    res.end();
  }
}

// Утилита для получения raw body
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
```

**Альтернативный вариант с http-proxy-middleware:**

```typescript
// pages/api/proxydocs/[...path].ts
import { createProxyMiddleware } from 'http-proxy-middleware';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const proxy = createProxyMiddleware({
  target: process.env.KEEP_DOCS_SERVER_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/proxydocs': '', // удаляем префикс
  },
  onProxyReq: (proxyReq, req) => {
    // Добавляем Bearer токен
    const token = getTokenFromRequest(req);
    if (token) {
      proxyReq.setHeader('Authorization', `Bearer ${token}`);
    }
  },
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxy(req, res);
}
```

**Схема работы:**
```
[Keep Docs UI] → [Ваш прокси /api/proxydocs] → [Keep Docs Server]
                        ↑ добавляет Bearer токен
```

## ✨ Функциональность

### 📁 Управление документами

- ✅ **Система вкладок** с автоматической фильтрацией по схеме
- ✅ **Drag & Drop загрузка** файлов с поддержкой множественного выбора
- ✅ **Версионирование** документов
- ✅ **Превью документов** всех поддерживаемых форматов

### 🖼️ Интерактивный просмотр изображений

- ✅ **Модальное окно** для полноэкранного просмотра
- ✅ **Навигация между страницами** с помощью кнопок и клавиш стрелок
- ✅ **Масштабирование** (zoom in/out) с поддержкой колеса мыши
- ✅ **Поворот изображений** на 90°, 180°, 270°
- ✅ **Сброс к исходному состоянию**

### 🎛️ Управление страницами

- ✅ **Добавление/Удаление страниц**
- ✅ **Скачивание отдельных страниц** и целых документов

### ♿ Доступность (a11y)

- ✅ **Полная поддержка клавиатуры** для всех интерактивных элементов
- ✅ **ARIA-атрибуты** для скринридеров
- ✅ **Семантическая разметка** с правильными ролями
- ✅ **Focus management** в модальных окнах

### 🔧 Техническое

- ✅ **TypeScript** поддержка из коробки
- ✅ **Обработка ошибок** с детальными сообщениями
- ✅ **Состояния загрузки** с индикаторами прогресса
- ✅ **Мемоизация** для оптимизации производительности

## 🎨 Стили

Подключите CSS файл для корректного отображения:

```tsx
import '@keep-docs/ui/styles/KeepDocs.css';
```

### Кастомизация темы

Библиотека поддерживает CSS переменные для настройки внешнего вида:

## 🎯 Горячие клавиши

### В модальном окне просмотра:

- `Esc` - Закрыть модальное окно
- `←` / `→` - Навигация между страницами
- `+` / `-` - Увеличение/уменьшение масштаба
- `R` - Поворот изображения
- `Space` - Сброс к исходному состоянию

## 🛠️ Разработка

```bash
# Установка зависимостей
npm install

# Сборка библиотеки
npm run build

# Режим разработки с hot reload
npm run dev

# Проверка типов TypeScript
npm run typecheck

# Линтинг и исправление кода
npm run lint
npm run lint:fix

# Форматирование кода
npm run format
```
