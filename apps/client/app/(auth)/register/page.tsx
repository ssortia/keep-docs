'use client';

import { Layout } from 'antd';
import RegisterForm from '../../components/RegisterForm';

const { Content } = Layout;

export default function RegisterPage() {
  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '50px', background: 'transparent' }}>
        <RegisterForm />
      </Content>
    </Layout>
  );
}