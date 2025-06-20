import { Space, Button } from 'antd';
import { ZodForm, TextField, PasswordField, SelectField, CheckboxField } from '@ssortia/antd-zod-bridge';
import { userCreateSchema, userEditSchema, type UserCreateFormData, type UserEditFormData } from '@/app/schemas/user';
import type { User, Role } from '../types';

interface UserFormProps {
  user?: User | null;
  roles: Role[];
  onSubmit: (values: UserCreateFormData | UserEditFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function UserForm({ user, roles, onSubmit, onCancel, loading = false }: UserFormProps) {
  const isEditing = !!user;
  const schema = isEditing ? userEditSchema : userCreateSchema;

  const defaultValues = isEditing
    ? {
        fullName: user?.fullName || '',
        email: user?.email || '',
        roleId: user?.roleId || undefined,
        blocked: user?.blocked || false,
      }
    : {
        blocked: false,
      };

  const handleSubmit = async (values: UserCreateFormData | UserEditFormData) => {
    try {
      await onSubmit(values);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <ZodForm schema={schema} onSubmit={handleSubmit} defaultValues={defaultValues}>
      <TextField
        name="fullName"
        label="Полное имя"
        placeholder="Введите полное имя"
      />

      <TextField
        name="email"
        label="Email"
        placeholder="Введите email"
      />

      {!isEditing && (
        <PasswordField
          name="password"
          label="Пароль"
          placeholder="Введите пароль"
        />
      )}

      <SelectField
        name="roleId"
        label="Роль"
        placeholder="Выберите роль"
        allowClear
        options={roles.map((role) => ({
          value: role.id,
          label: role.description ? `${role.name} - ${role.description}` : role.name
        }))}
      />

      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>Статус</div>
        <CheckboxField
          name="blocked"
        >
          Заблокирован
        </CheckboxField>
      </div>

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
