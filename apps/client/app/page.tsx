'use client';

import Link from 'next/link';
import { Button, Card, Col, Row, Skeleton, Space, Typography } from 'antd';
import { LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAuth } from './hooks/useAuth';
import KeepDocsDemo from '@/app/components/KeepDocsDemo';

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
                  Этот шаблон включает в себя готовую систему аутентификации, управления ролями и
                  разрешениями, а также современный UI.
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
                    <Button size="large" icon={<LoginOutlined />} style={{ width: '100%' }}>
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
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Row gutter={[20, 20]}>
            <Col span={12}>
              <Skeleton paragraph={{ rows: 6 }} />
              <br />
              <br />
              <Skeleton paragraph={{ rows: 6 }} />
              <br />
              <Skeleton paragraph={{ rows: 6 }} />
              <br />
              <Skeleton paragraph={{ rows: 6 }} />
            </Col>
            <Col span={12}>
              <KeepDocsDemo />
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
}
