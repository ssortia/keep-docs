import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Checkbox, Col, Divider, Row, Space } from 'antd';
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { TextAreaField, TextField, ZodForm } from '@ssortia/antd-zod-bridge';
import { type RoleFormData, roleSchema } from '@/app/schemas/role';
import type { Permission, Role } from '../types';

interface RoleFormProps {
  role?: Role | null;
  permissions: Permission[];
  onSubmit: (values: RoleFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function RoleForm({
  role,
  permissions,
  onSubmit,
  onCancel,
  loading = false,
}: RoleFormProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  const defaultValues = role
    ? {
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions?.map((p) => p.id) || [],
      }
    : {
        permissions: [],
      };

  // Группировка прав по префиксу (users, roles, permissions и т.д.)
  const groupedPermissions = useMemo(() => {
    const groups: { [key: string]: Permission[] } = {};

    permissions.forEach((permission) => {
      const [prefix] = permission.name.split('.');
      if (!groups[prefix]) {
        groups[prefix] = [];
      }
      groups[prefix].push(permission);
    });

    return groups;
  }, [permissions]);

  // Получение русских названий для групп
  const getGroupTitle = (groupKey: string) => {
    const titles: { [key: string]: string } = {
      users: 'Пользователи',
      roles: 'Роли',
      permissions: 'Права',
      dashboard: 'Панель управления',
      settings: 'Настройки',
    };
    return titles[groupKey] || groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
  };

  // Получение русских названий для операций
  const getActionTitle = (action: string) => {
    const titles: { [key: string]: string } = {
      view: 'Просмотр',
      create: 'Создание',
      edit: 'Редактирование',
      delete: 'Удаление',
      manage: 'Управление',
    };
    return titles[action] || action;
  };

  useEffect(() => {
    if (role && role.permissions) {
      setSelectedPermissions(role.permissions.map((p) => p.id));
    } else {
      setSelectedPermissions([]);
    }
  }, [role]);

  const handleSubmit = async (values: RoleFormData) => {
    try {
      await onSubmit({
        ...values,
        permissions: selectedPermissions,
      });
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    setSelectedPermissions((prev) =>
      checked ? [...prev, permissionId] : prev.filter((id) => id !== permissionId),
    );
  };

  const handleGroupChange = (groupPermissions: Permission[], checked: boolean) => {
    const groupIds = groupPermissions.map((p) => p.id);
    setSelectedPermissions((prev) =>
      checked ? [...new Set([...prev, ...groupIds])] : prev.filter((id) => !groupIds.includes(id)),
    );
  };

  const isGroupChecked = (groupPermissions: Permission[]) => {
    const groupIds = groupPermissions.map((p) => p.id);
    return groupIds.every((id) => selectedPermissions.includes(id));
  };

  const isGroupIndeterminate = (groupPermissions: Permission[]) => {
    const groupIds = groupPermissions.map((p) => p.id);
    const checkedCount = groupIds.filter((id) => selectedPermissions.includes(id)).length;
    return checkedCount > 0 && checkedCount < groupIds.length;
  };

  return (
    <ZodForm schema={roleSchema} onSubmit={handleSubmit} defaultValues={defaultValues}>
      <TextField name="name" label="Название роли" placeholder="Введите название роли" />

      <TextAreaField
        name="description"
        label="Описание"
        placeholder="Введите описание роли"
        rows={3}
      />

      <Divider>Права доступа</Divider>

      <div
        style={{
          maxHeight: '400px',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '8px 0',
        }}
      >
        <Row gutter={[16, 16]}>
          {Object.entries(groupedPermissions).map(([groupKey, groupPermissions]) => (
            <Col span={24} key={groupKey}>
              <Card
                size="small"
                title={
                  <Checkbox
                    checked={isGroupChecked(groupPermissions)}
                    indeterminate={isGroupIndeterminate(groupPermissions)}
                    onChange={(e) => handleGroupChange(groupPermissions, e.target.checked)}
                  >
                    <strong>{getGroupTitle(groupKey)}</strong>
                  </Checkbox>
                }
                styles={{ body: { padding: '12px 16px' } }}
                style={{ width: '100%', minWidth: 0 }}
              >
                <Row gutter={[8, 8]} style={{ margin: 0 }}>
                  {groupPermissions
                    .sort((a, b) => a.id - b.id)
                    .map((permission) => {
                      const [, action] = permission.name.split('.');
                      return (
                        <Col
                          xs={24}
                          sm={12}
                          md={12}
                          lg={12}
                          xl={12}
                          key={permission.id}
                          style={{ minWidth: 0 }}
                        >
                          <Checkbox
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={(e) =>
                              handlePermissionChange(permission.id, e.target.checked)
                            }
                            style={{ width: '100%', whiteSpace: 'normal', wordBreak: 'break-word' }}
                          >
                            <span style={{ fontSize: '14px' }}>
                              {permission.description || getActionTitle(action)}
                            </span>
                          </Checkbox>
                        </Col>
                      );
                    })}
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Divider />

      <div style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel} icon={<CloseOutlined />}>
            Отмена
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
            {role ? 'Обновить' : 'Создать'}
          </Button>
        </Space>
      </div>
    </ZodForm>
  );
}