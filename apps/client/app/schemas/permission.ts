import { z } from 'zod';

export const permissionSchema = z.object({
  name: z
    .string()
    .min(1, 'Введите название разрешения')
    .max(255, 'Название не должно превышать 255 символов')
    .regex(
      /^[a-zA-Z0-9._-]+$/, 
      'Название может содержать только буквы, цифры, точки, подчеркивания и дефисы'
    ),
  
  description: z
    .string()
    .max(500, 'Описание не должно превышать 500 символов')
    .optional(),
});

export type PermissionFormData = z.infer<typeof permissionSchema>;