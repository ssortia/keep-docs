'use client';

import { useState, useCallback } from 'react';
import { Button, Modal, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import { useRoles } from '../hooks/useRoles';
import UsersTable from '../components/UsersTable';
import UserForm from '../components/UserForm';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import type { User, UserFormData } from '../types';

export default function UsersPage() {
  const { user, hasPermission } = useAuth();
  const { users, loading: usersLoading, pagination, createUser, updateUser, deleteUser, fetchUsers } = useUsers();
  const { roles } = useRoles();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const canView = hasPermission('users.view');
  const canCreate = hasPermission('users.create');
  const canEdit = hasPermission('users.edit');
  const canDelete = hasPermission('users.delete');

  const handleCreate = () => {
    setEditingUser(null);
    setModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await deleteUser(id);
  };

  const handleSubmit = async (values: UserFormData) => {
    try {
      setFormLoading(true);
      if (editingUser) {
        await updateUser(editingUser.id, values);
      } else {
        await createUser(values);
      }
      setModalVisible(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingUser(null);
  };

  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    fetchUsers(1, pagination.pageSize, value);
  }, [fetchUsers, pagination.pageSize]);

  const handlePageChangeWithSearch = useCallback((page: number, pageSize?: number) => {
    fetchUsers(page, pageSize || pagination.pageSize, searchText);
  }, [fetchUsers, pagination.pageSize, searchText]);

  if (!canView) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Нет доступа</h2>
        <p>У вас нет разрешения на просмотр пользователей</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <PageHeader
          title="Пользователи"
          extra={
            <>
              <SearchInput
                placeholder="Поиск пользователей..."
                value={searchText}
                onChange={handleSearch}
              />
              {canCreate && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  Добавить пользователя
                </Button>
              )}
            </>
          }
        />

        <UsersTable
          users={users}
          loading={usersLoading}
          currentUserId={user?.id}
          canEdit={canEdit}
          canDelete={canDelete}
          pagination={pagination}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={handlePageChangeWithSearch}
        />
      </Card>

      <Modal
        title={editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={500}
        destroyOnHidden
      >
        <UserForm
          user={editingUser}
          roles={roles}
          onSubmit={handleSubmit}
          onCancel={handleModalClose}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
}
