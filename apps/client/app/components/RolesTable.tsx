import { Table, Button, Space, Popconfirm, Tag, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, CrownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Role } from '../types';
import { formatDate } from '../utils/dateUtils';

interface RolesTableProps {
  roles: Role[];
  loading: boolean;
  canEdit: boolean;
  canDelete: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
  onPageChange: (page: number, pageSize?: number) => void;
}

export default function RolesTable({
  roles,
  loading,
  canEdit,
  canDelete,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
}: RolesTableProps) {
  const columns: ColumnsType<Role> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <CrownOutlined style={{ color: '#1890ff' }} />
          <Tag color="blue">{text}</Tag>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      render: (text: string | null) => {
        if (!text) return <span style={{ color: '#999' }}>—</span>;
        
        if (text.length > 100) {
          return (
            <Tooltip title={text}>
              <span>{text.substring(0, 100)}...</span>
            </Tooltip>
          );
        }
        
        return text;
      },
      sorter: (a, b) => (a.description || '').localeCompare(b.description || ''),
    },
    {
      title: 'Права',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: any[]) => {
        if (!permissions || permissions.length === 0) {
          return <span style={{ color: '#999' }}>Нет прав</span>;
        }
        
        const groupedPermissions: { [key: string]: string[] } = {};
        permissions.forEach(permission => {
          const [prefix] = permission.name.split('.');
          if (!groupedPermissions[prefix]) {
            groupedPermissions[prefix] = [];
          }
          groupedPermissions[prefix].push(permission.name);
        });

        const groups = Object.keys(groupedPermissions);
        if (groups.length <= 2) {
          return (
            <Space size="small" wrap>
              {groups.map(group => (
                <Tag key={group} color="green">
                  {group} ({groupedPermissions[group].length})
                </Tag>
              ))}
            </Space>
          );
        }

        return (
          <Tooltip title={
            <div>
              {groups.map(group => (
                <div key={group}>
                  <strong>{group}:</strong> {groupedPermissions[group].join(', ')}
                </div>
              ))}
            </div>
          }>
            <Tag color="green">
              {permissions.length} {permissions.length === 1 ? 'право' : 
               permissions.length < 5 ? 'права' : 'прав'}
            </Tag>
          </Tooltip>
        );
      },
      width: 200,
    },
    {
      title: 'Создано',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => formatDate(text),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      width: 180,
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 120,
      render: (_, record: Role) => (
        <Space size="small">
          {canEdit && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              title="Редактировать"
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Удалить роль?"
              description={
                <div>
                  <p>Это действие нельзя отменить.</p>
                  <p><strong>Внимание:</strong> Удаление может повлиять на пользователей с этой ролью.</p>
                </div>
              }
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
      dataSource={roles}
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