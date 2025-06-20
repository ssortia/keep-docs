'use client';

import { Card, Descriptions, Space, Spin, Tag, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const { Title, Text } = Typography;

export default function UserProfile() {
  const { user, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>Загрузка...</div>
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Text type="secondary">Пользователь не авторизован</Text>
        </div>
      </Card>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ marginBottom: 0 }}>
            <UserOutlined style={{ marginRight: '8px' }} />
            Профиль пользователя
          </Title>

          <Descriptions
            bordered
            column={1}
            items={[
              {
                key: 'id',
                label: 'ID',
                children: user.id,
              },
              {
                key: 'name',
                label: 'Имя',
                children: user.fullName || 'Не указано',
              },
              {
                key: 'email',
                label: 'Email',
                children: user.email,
              },
              {
                key: 'role',
                label: 'Роль',
                children: userRole ? (
                  <Tag color={userRole === 'admin' ? 'red' : 'blue'}>{userRole}</Tag>
                ) : (
                  'Не назначена'
                ),
              },
            ]}
          />
        </Space>
      </Card>
    </Space>
  );
}
