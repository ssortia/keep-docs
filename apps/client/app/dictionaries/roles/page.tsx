'use client';

import { useState, useCallback } from 'react';
import { Button, Modal, Card, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useRoles } from '../../hooks/useRoles';
import { usePermissions } from '../../hooks/usePermissions';
import RolesTable from '../../components/RolesTable';
import RoleForm from '../../components/RoleForm';
import PageHeader from '../../components/PageHeader';
import SearchInput from '../../components/SearchInput';
import type { Role, RoleFormData } from '../../types';

export default function RolesPage() {
  const { hasPermission } = useAuth();
  const { 
    roles, 
    loading: rolesLoading, 
    pagination, 
    createRole, 
    updateRole, 
    deleteRole, 
    fetchRoles
  } = useRoles();
  const { permissions } = usePermissions();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchText, setSearchText] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const canView = hasPermission('roles.view');
  const canCreate = hasPermission('roles.create');
  const canEdit = hasPermission('roles.edit');
  const canDelete = hasPermission('roles.delete');

  const handleCreate = () => {
    setEditingRole(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Role) => {
    setEditingRole(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await deleteRole(id);
  };

  const handleSubmit = async (values: RoleFormData) => {
    try {
      setFormLoading(true);
      if (editingRole) {
        await updateRole(editingRole.id, values);
      } else {
        await createRole(values);
      }
      setModalVisible(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingRole(null);
  };

  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    fetchRoles(1, pagination.pageSize, value);
  }, [fetchRoles, pagination.pageSize]);

  const handlePageChangeWithSearch = useCallback((page: number, pageSize?: number) => {
    fetchRoles(page, pageSize || pagination.pageSize, searchText);
  }, [fetchRoles, pagination.pageSize, searchText]);

  if (!canView) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Нет доступа</h2>
        <p>У вас нет разрешения на просмотр ролей</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <PageHeader
          title="Роли"
          extra={
            <>
              <SearchInput
                placeholder="Поиск ролей..."
                value={searchText}
                onChange={handleSearch}
              />
              {canCreate && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  Добавить роль
                </Button>
              )}
            </>
          }
        />

        <RolesTable
          roles={roles}
          loading={rolesLoading}
          canEdit={canEdit}
          canDelete={canDelete}
          pagination={pagination}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={handlePageChangeWithSearch}
        />
      </Card>

      <Modal
        title={editingRole ? 'Редактировать роль' : 'Добавить роль'}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={700}
        destroyOnHidden
      >
        <RoleForm
          role={editingRole}
          permissions={permissions}
          onSubmit={handleSubmit}
          onCancel={handleModalClose}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
}