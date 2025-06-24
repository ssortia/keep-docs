# Keep Docs UI

React UI библиотека для работы с сервисом хранения документов.

## Установка

```bash
npm install @keep-docs/ui
```

## Использование

```tsx
import React from 'react';
import { KeepDocs, exampleUISchema } from '@keep-docs/ui';
import '@keep-docs/ui/styles/KeepDocs.css';

const config = {
  baseUrl: 'http://localhost:3333',
  schema: 'client_dossier'
};

const params = {
  statusCode: 'CREATION',
  userType: 'INDIVIDUAL'
};

function App() {
  return (
    <KeepDocs
      config={config}
      schema={exampleUISchema}
      uuid="550e8400-e29b-41d4-a716-446655440000"
      defaultTab="passport"
      params={params}
      onError={console.log}
      onInit={console.log}
      onUpdate={console.log}
      onRemove={console.log}
    />
  );
}
```

## Props

### KeepDocs

| Prop | Тип | Описание |
|------|-----|----------|
| `config` | `DocumentManagerConfig` | Конфигурация подключения к API |
| `schema` | `UISchema` | Схема отображения документов |
| `uuid` | `string` | UUID досье |
| `defaultTab?` | `string` | Вкладка по умолчанию |
| `params?` | `object` | Параметры для фильтрации |
| `onError?` | `(error: string) => void` | Обработчик ошибок |
| `onInit?` | `(dossier: Dossier) => void` | Вызывается после инициализации |
| `onUpdate?` | `(document: Document) => void` | Вызывается после загрузки |
| `onRemove?` | `(type: string, uuid: string) => void` | Вызывается после удаления |

## Схема документов

```tsx
const schema: UISchema = {
  documents: [
    {
      type: 'passport',
      name: 'Паспорт',
      required: ['CREATION'],
      access: {
        show: '*',
        editable: {
          statusCode: ['CREATION', 'CREATED']
        }
      },
      accept: ['image/*', 'application/pdf']
    }
  ]
};
```

### Параметры доступа

- `show: '*'` - всегда показывать
- `show: ['STATUS1']` - показывать при определенных условиях
- `show: { paramName: ['value1', 'value2'] }` - показывать при соответствии параметрам

Аналогично для `editable` и `required`.

## Функциональность

- ✅ Система вкладок с фильтрацией по схеме
- ✅ Загрузка файлов через drag&drop
- ✅ Модальное окно настройки версий
- ✅ Превью загруженных страниц
- ✅ Увеличение изображений
- ✅ Удаление страниц
- ✅ Обработка ошибок

## Стили

Подключите CSS файл для корректного отображения:

```tsx
import '@keep-docs/ui/styles/KeepDocs.css';
```

## Разработка

```bash
# Сборка
npm run build

# Режим разработки
npm run dev

# Проверка типов
npm run typecheck

# Линтинг
npm run lint
```