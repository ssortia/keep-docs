import type { DocumentVersion } from '../../types';

export function generateDefaultVersionName(): string {
  const now = new Date();
  const date = now.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const time = now.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date}.${time}`;
}

export function sortVersionsByDate(versions: DocumentVersion[]): DocumentVersion[] {
  return [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}