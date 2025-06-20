'use client';

import { usePathname } from 'next/navigation';
import { Layout } from 'antd';
import { useAuth } from '../hooks/useAuth';
import AppHeader from './AppHeader';

const { Content } = Layout;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const showHeader = isAuthenticated && !isAuthPage && !isLoading;

  if (isLoading) {
    return (
      <Layout style={{ minHeight: '100vh', background: 'var(--background)' }}>
        <Content style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'transparent'
        }}>
          Загрузка...
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {showHeader && <AppHeader />}
      <Content style={{ 
        padding: showHeader ? '0' : '24px',
        background: 'transparent'
      }}>
        {children}
      </Content>
    </Layout>
  );
}
