'use client';

import { useAuth } from '@/app/hooks/useAuth';
import PageHeader from '@/app/components/PageHeader';
import AccessDenied from '@/app/admin/components/AccessDenied';
import AuditLogsCard from '@/app/admin/components/AuditLogsCard';

export default function AdminDashboard() {
  const { hasPermission } = useAuth();

  const hasAccess = hasPermission('admin.access');

  if (!hasAccess) {
    return <AccessDenied />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <PageHeader title="Панель администратора" subtitle="Мониторинг" />

      <div style={{ marginTop: '16px' }}>
        <AuditLogsCard />
      </div>
    </div>
  );
}
