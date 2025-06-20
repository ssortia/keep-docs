import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Имя обязательно для заполнения')
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Имя не должно превышать 100 символов'),
  
  email: z
    .string()
    .min(1, 'Email обязателен для заполнения')
    .email('Некорректный формат email')
    .max(255, 'Email не должен превышать 255 символов'),
  
  password: z
    .string()
    .min(1, 'Пароль обязателен для заполнения')
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .max(255, 'Пароль не должен превышать 255 символов'),
  
  passwordConfirmation: z
    .string()
    .min(1, 'Подтвердите пароль'),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'Пароли не совпадают',
  path: ['passwordConfirmation'],
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен для заполнения')
    .email('Некорректный формат email'),
  
  password: z
    .string()
    .min(1, 'Пароль обязателен для заполнения'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;