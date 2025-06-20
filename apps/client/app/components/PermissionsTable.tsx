import { Table, Button, Space, Popconfirm, Tag, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Permission } from '../types';
import { formatDate } from '../utils/dateUtils';

interface PermissionsTableProps {
  permissions: Permission[];
  loading: boolean;
  canEdit: boolean;
  canDelete: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onEdit: (permission: Permission) => void;
  onDelete: (id: number) => void;
  onPageChange: (page: number, pageSize?: number) => void;
}

export default function PermissionsTable({
  permissions,
  loading,
  canEdit,
  canDelete,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
}: PermissionsTableProps) {
  const columns: ColumnsType<Permission> = [
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
          <KeyOutlined style={{ color: '#1890ff' }} />
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
      render: (_, record: Permission) => (
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
              title="Удалить разрешение?"
              description={
                <div>
                  <p>Это действие нельзя отменить.</p>
                  <p><strong>Внимание:</strong> Удаление может повлиять на пользователей с этим разрешением.</p>
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
      dataSource={permissions}
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
