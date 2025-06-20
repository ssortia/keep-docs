import { z } from 'zod';

export const roleSchema = z.object({
  name: z
    .string()
    .min(1, 'Введите название роли')
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(50, 'Название не должно превышать 50 символов'),

  description: z
    .string()
    .max(255, 'Описание не должно превышать 255 символов')
    .optional(),

  permissions: z.array(z.number())
});

export type RoleFormData = z.infer<typeof roleSchema>;
