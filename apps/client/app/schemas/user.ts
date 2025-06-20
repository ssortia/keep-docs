import { z } from 'zod';

const baseUserSchema = {
  fullName: z
    .string()
    .max(255, 'Имя не должно превышать 255 символов')
    .optional(),

  email: z
    .string()
    .min(1, 'Введите email')
    .email('Введите корректный email')
    .max(255, 'Email не должен превышать 255 символов'),

  roleId: z
    .number()
    .optional(),

  blocked: z.boolean()
};

export const userCreateSchema = z.object({
  ...baseUserSchema,
  password: z
    .string()
    .min(1, 'Введите пароль')
    .min(6, 'Пароль должен быть не менее 6 символов')
    .max(255, 'Пароль не должен превышать 255 символов'),
});

export const userEditSchema = z.object(baseUserSchema);

export type UserCreateFormData = z.infer<typeof userCreateSchema>;
export type UserEditFormData = z.infer<typeof userEditSchema>;