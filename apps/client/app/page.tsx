'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Typography, Space, Button, Card } from 'antd';
import { UserAddOutlined, LoginOutlined } from '@ant-design/icons';
import UserProfile from './components/UserProfile';
import KeepDocsDemo from './components/KeepDocsDemo';
import { useAuth } from './hooks/useAuth';

const { Title, Paragraph } = Typography;

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '50px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            
            <Card style={{ textAlign: 'center' }}>
              <Space direction="vertical" size="large">
                <Title level={1}>AdonisJS + Next.js Template</Title>
                <Paragraph style={{ fontSize: '16px', color: '#666' }}>
                  Готовое решение с системой аутентификации и управления ролями
                </Paragraph>
              </Space>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <Card title="О проекте">
                <Paragraph>
                  Этот шаблон включает в себя готовую систему аутентификации, 
                  управления ролями и разрешениями, а также современный UI.
                </Paragraph>
              </Card>
              
              <Card title="Начать работу">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Link href="/register" style={{ textDecoration: 'none' }}>
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<UserAddOutlined />}
                      style={{ width: '100%' }}
                    >
                      Регистрация
                    </Button>
                  </Link>
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <Button 
                      size="large" 
                      icon={<LoginOutlined />}
                      style={{ width: '100%' }}
                    >
                      Войти в систему
                    </Button>
                  </Link>
                </Space>
              </Card>
            </div>
            
          </Space>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>

          <Card style={{ textAlign: 'center' }}>
            <Space direction="vertical" size="large">
              <Title level={1}>Добро пожаловать, {user.fullName || user.email}!</Title>
            </Space>
          </Card>

          <Card>
            <KeepDocsDemo />
          </Card>

          {/* <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}> */}
          {/*   <UserProfile /> */}
          {/*    */}
          {/*   <Card title="Полезные ссылки"> */}
          {/*     <Space direction="vertical" style={{ width: '100%' }}> */}
          {/*       <a */}
          {/*         href="https://nextjs.org/learn" */}
          {/*         target="_blank" */}
          {/*         rel="noopener noreferrer" */}
          {/*         style={{ color: '#1890ff' }} */}
          {/*       > */}
          {/*         <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} /> */}
          {/*         {' '}Learn Next.js */}
          {/*       </a> */}
          {/*       <a */}
          {/*         href="https://adonisjs.com" */}
          {/*         target="_blank" */}
          {/*         rel="noopener noreferrer" */}
          {/*         style={{ color: '#1890ff' }} */}
          {/*       > */}
          {/*         <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} /> */}
          {/*         {' '}AdonisJS Documentation */}
          {/*       </a> */}
          {/*     </Space> */}
          {/*   </Card> */}
          {/* </div> */}
          
        </Space>
      </div>
    </div>
  );
}
