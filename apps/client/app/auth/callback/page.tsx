'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spin } from 'antd';
import { useAuth } from '@/app/hooks/useAuth';

export default function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      setToken(token).then(() => {
        router.push('/');
      }).catch((error) => {
        console.error('Error setting token:', error);
        router.push('/login?error=oauth_failed');
      });
    } else {
      router.push('/login?error=oauth_failed');
    }
  }, [searchParams, router, setToken]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <Spin size="large" />
    </div>
  );
}