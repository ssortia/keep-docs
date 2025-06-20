'use client';

import { Layout } from 'antd';
import LoginForm from '../../components/LoginForm';

const { Content } = Layout;

export default function LoginPage() {
  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '50px', background: 'transparent' }}>
        <LoginForm />
      </Content>
    </Layout>
  );
}