'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Typography, Alert, Spin, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '@/app/services/api';

const { Title, Paragraph } = Typography;

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Отсутствует токен подтверждения');
      return;
    }

    if (hasVerified.current) return;

    const verifyEmail = async () => {
      if (hasVerified.current) return;
      
      hasVerified.current = true;
      
      try {
        await api.get(`/api/auth/verify-email/${token}`);
        setStatus('success');
        setMessage('Email успешно подтвержден! Теперь вы можете войти в систему.');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.data?.message || error.message || 'Ошибка при подтверждении email');
      }
    };

    verifyEmail();
  }, [token]);

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f5f5f5',
      padding: '20px'
    }}>
      <Card style={{ maxWidth: 500, width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2}>Подтверждение Email</Title>
          
          {status === 'loading' && (
            <div>
              <Spin size="large" />
              <Paragraph style={{ marginTop: 16 }}>
                Подтверждаем ваш email...
              </Paragraph>
            </div>
          )}

          {status === 'success' && (
            <div>
              <CheckCircleOutlined 
                style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} 
              />
              <Alert 
                message="Успешно!" 
                description={message}
                type="success" 
                showIcon={false}
                style={{ marginBottom: 16 }}
              />
              <Button 
                type="primary" 
                size="large" 
                onClick={handleGoToLogin}
              >
                Войти в систему
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div>
              <CloseCircleOutlined 
                style={{ fontSize: 64, color: '#f5222d', marginBottom: 16 }} 
              />
              <Alert 
                message="Ошибка" 
                description={message}
                type="error" 
                showIcon={false}
                style={{ marginBottom: 16 }}
              />
              <Button 
                type="default" 
                size="large" 
                onClick={handleGoToLogin}
              >
                Вернуться к входу
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}