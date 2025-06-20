import { Space, Button } from 'antd';
import { ZodForm, TextField, TextAreaField } from '@ssortia/antd-zod-bridge';
import { permissionSchema, type PermissionFormData } from '@/app/schemas/permission';
import type { Permission } from '../types';

interface PermissionFormProps {
  permission?: Permission | null;
  onSubmit: (values: PermissionFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function PermissionForm({ 
  permission, 
  onSubmit, 
  onCancel, 
  loading = false 
}: PermissionFormProps) {
  const isEditing = !!permission;
  
  const defaultValues = isEditing
    ? {
        name: permission?.name || '',
        description: permission?.description || '',
      }
    : undefined;

  const handleSubmit = async (values: PermissionFormData) => {
    try {
      await onSubmit(values);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <ZodForm schema={permissionSchema} onSubmit={handleSubmit} defaultValues={defaultValues}>
      <TextField
        name="name"
        label="Название разрешения"
        placeholder="Например: users.view, admin.access"
        disabled={isEditing}
      />

      <TextAreaField
        name="description"
        label="Описание"
        placeholder="Описание разрешения (необязательно)"
        rows={3}
        maxLength={500}
        showCount
      />

      <div style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel} disabled={loading}>
            Отмена
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditing ? 'Обновить' : 'Создать'}
          </Button>
        </Space>
      </div>
    </ZodForm>
  );
}
