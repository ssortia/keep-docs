'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '@/app/hooks/useAuth';
import { registerSchema, type RegisterFormData } from '@/app/schemas/auth';
import { PasswordField, TextField, ZodForm } from '@ssortia/antd-zod-bridge';

const { Title } = Typography;

export default function RegisterForm() {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await registerUser(data);
      // Успешная регистрация - редирект на login происходит автоматически
    } catch (error: any) {
      if (error.status === 409) {
        setError('Пользователь с таким email уже существует');
      } else {
        setError(error.message || 'Произошла ошибка при регистрации');
      }
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 0 }}>
            Регистрация
          </Title>

          {error && <Alert message={error} type="error" showIcon />}

          <ZodForm schema={registerSchema} onSubmit={onSubmit}>
            <TextField
              name="fullName"
              label="Полное имя"
              prefix={<UserOutlined />}
              placeholder="Введите полное имя"
            />

            <TextField
              name="email"
              label="Email"
              prefix={<MailOutlined />}
              placeholder="Введите email"
            />

            <PasswordField
              name="password"
              label="Пароль"
              prefix={<LockOutlined />}
              placeholder="Введите пароль"
            />

            <PasswordField
              name="passwordConfirmation"
              label="Подтверждение пароля"
              prefix={<LockOutlined />}
              placeholder="Подтвердите пароль"
            />

            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
              style={{ width: '100%' }}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </ZodForm>

          <div style={{ textAlign: 'center' }}>
            <Typography.Text type="secondary">
              Уже есть аккаунт?{' '}
              <Link href="/login" style={{ color: '#1890ff' }}>
                Войти
              </Link>
            </Typography.Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}
