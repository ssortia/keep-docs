import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { User } from '../types';
import { formatDate } from '../utils/dateUtils';

interface UsersTableProps {
  users: User[];
  loading: boolean;
  currentUserId?: number;
  canEdit: boolean;
  canDelete: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  onPageChange: (page: number, pageSize?: number) => void;
}

export default function UsersTable({
  users,
  loading,
  currentUserId,
  canEdit,
  canDelete,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
}: UsersTableProps) {
  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Имя',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string | null) => text || <span style={{ color: '#999' }}>—</span>,
      sorter: (a, b) => (a.fullName || '').localeCompare(b.fullName || ''),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role: User['role']) => {
        if (!role) return <span style={{ color: '#999' }}>—</span>;
        return (
          <Tag color={getRoleColor(role.name)}>
            {role.name}
          </Tag>
        );
      },
      sorter: (a, b) => (a.role?.name || '').localeCompare(b.role?.name || ''),
    },
    {
      title: 'Статус',
      dataIndex: 'blocked',
      key: 'blocked',
      width: 100,
      render: (blocked: boolean) => (
        <Tag color={blocked ? 'red' : 'green'}>
          {blocked ? 'Заблокирован' : 'Активен'}
        </Tag>
      ),
      sorter: (a, b) => Number(a.blocked) - Number(b.blocked),
    },
    {
      title: 'Создан',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => formatDate(text),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 120,
      render: (_, record: User) => (
        <Space size="small">
          {canEdit && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              title="Редактировать"
            />
          )}
          {canDelete && record.id !== currentUserId && (
            <Popconfirm
              title="Удалить пользователя?"
              description="Это действие нельзя отменить"
              onConfirm={() => onDelete(record.id)}
              okText="Да"
              cancelText="Нет"
              okType="danger"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                title="Удалить"
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      rowKey="id"
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} из ${total} записей`,
        pageSizeOptions: ['10', '20', '50', '100'],
        onChange: onPageChange,
        onShowSizeChange: onPageChange,
      }}
      scroll={{ x: 800 }}
    />
  );
}

function getRoleColor(roleName: string): string {
  const colorMap: Record<string, string> = {
    admin: 'red',
    manager: 'orange',
    user: 'blue',
    guest: 'default',
  };
  
  return colorMap[roleName.toLowerCase()] || 'default';
}
