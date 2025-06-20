'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Alert, Button, Card, Divider, Space, Typography } from 'antd';
import { GithubOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { type LoginFormData, loginSchema } from '@/app/schemas/auth';
import { PasswordField, TextField, ZodForm } from '@ssortia/antd-zod-bridge';

const { Title } = Typography;

export default function LoginForm() {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const { login } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Проверяем, был ли пользователь перенаправлен после регистрации
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage(
        'Регистрация прошла успешно! На вашу почту отправлено письмо с подтверждением.',
      );
    }

    if (searchParams.get('error') === 'oauth_failed') {
      setError('Ошибка при авторизации через GitHub. Попробуйте еще раз.');
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await login(data.email, data.password);
    } catch (error: any) {
      console.log(error);
      if (error.status === 401) {
        setError('Неверный email или пароль');
      } else if (error.status === 403) {
        setError('Ваш аккаунт заблокирован. Обратитесь к администратору');
      } else {
        setError(error.message || 'Произошла ошибка при входе');
      }
      setIsLoading(false);
    }
  };

  const handleGithubLogin = () => {
    setIsGithubLoading(true);
    setError('');

    const backendUrl = 'http://localhost:3333';
    window.location.href = `${backendUrl}/api/auth/github`;
  };

  return (
    <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 0 }}>
            Вход
          </Title>

          {successMessage && <Alert message={successMessage} type="success" showIcon />}
          {error && <Alert message={error} type="error" showIcon />}

          <ZodForm schema={loginSchema} onSubmit={onSubmit}>
            <TextField
              name="email"
              label="Email"
              prefix={<UserOutlined />}
              placeholder="Введите email"
            />

            <PasswordField
              name="password"
              label="Пароль"
              prefix={<LockOutlined />}
              placeholder="Введите пароль"
            />

            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              disabled={isLoading || isGithubLoading}
              size="large"
              style={{ width: '100%' }}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
          </ZodForm>

          <Divider plain>или</Divider>

          <Button
            type="default"
            icon={<GithubOutlined />}
            size="large"
            loading={isGithubLoading}
            disabled={isLoading || isGithubLoading}
            style={{ width: '100%' }}
            onClick={handleGithubLogin}
          >
            {isGithubLoading ? 'Перенаправление на GitHub...' : 'Войти через GitHub'}
          </Button>

          <div style={{ textAlign: 'center' }}>
            <Typography.Text type="secondary">
              Нет аккаунта?{' '}
              <Link href="/register" style={{ color: '#1890ff' }}>
                Зарегистрироваться
              </Link>
            </Typography.Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}
