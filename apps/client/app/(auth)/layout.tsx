'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  // Показываем детей только если пользователь не аутентифицирован
  if (isLoading) {
    return null; // или компонент загрузки
  }

  if (user) {
    return null; // пользователь будет перенаправлен
  }

  return <>{children}</>;
}