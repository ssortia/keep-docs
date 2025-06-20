'use client';

import { useState, useCallback } from 'react';
import { Button, Modal, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionsTable from '../../components/PermissionsTable';
import PermissionForm from '../../components/PermissionForm';
import PageHeader from '../../components/PageHeader';
import SearchInput from '../../components/SearchInput';
import type { Permission, PermissionFormData } from '../../types';

export default function PermissionsPage() {
  const { hasPermission } = useAuth();
  const { 
    permissions, 
    loading: permissionsLoading, 
    pagination, 
    createPermission, 
    updatePermission, 
    deletePermission, 
    fetchPermissions
  } = usePermissions();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [searchText, setSearchText] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const canView = hasPermission('permissions.view');
  const canCreate = hasPermission('permissions.create');
  const canEdit = hasPermission('permissions.edit');
  const canDelete = hasPermission('permissions.delete');

  const handleCreate = () => {
    setEditingPermission(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Permission) => {
    setEditingPermission(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await deletePermission(id);
  };

  const handleSubmit = async (values: PermissionFormData) => {
    try {
      setFormLoading(true);
      if (editingPermission) {
        await updatePermission(editingPermission.id, values);
      } else {
        await createPermission(values);
      }
      setModalVisible(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingPermission(null);
  };

  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    fetchPermissions(1, pagination.pageSize, value);
  }, [fetchPermissions, pagination.pageSize]);

  const handlePageChangeWithSearch = useCallback((page: number, pageSize?: number) => {
    fetchPermissions(page, pageSize || pagination.pageSize, searchText);
  }, [fetchPermissions, pagination.pageSize, searchText]);

  if (!canView) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Нет доступа</h2>
        <p>У вас нет разрешения на просмотр разрешений</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <PageHeader
          title="Разрешения"
          extra={
            <>
              <SearchInput
                placeholder="Поиск разрешений..."
                value={searchText}
                onChange={handleSearch}
              />
              {canCreate && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  Добавить разрешение
                </Button>
              )}
            </>
          }
        />

        <PermissionsTable
          permissions={permissions}
          loading={permissionsLoading}
          canEdit={canEdit}
          canDelete={canDelete}
          pagination={pagination}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={handlePageChangeWithSearch}
        />
      </Card>

      <Modal
        title={editingPermission ? 'Редактировать разрешение' : 'Добавить разрешение'}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={500}
        destroyOnHidden
      >
        <PermissionForm
          permission={editingPermission}
          onSubmit={handleSubmit}
          onCancel={handleModalClose}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
}
