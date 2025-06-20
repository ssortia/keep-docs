import vine from '@vinejs/vine'

/**
 * Validator для регистрации пользователя
 */
export const registerValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim(),
    email: vine.string().email().trim().toLowerCase(),
    password: vine.string().minLength(6).trim(),
    passwordConfirmation: vine.string().confirmed({ confirmationField: 'password' }),
  })
)

/**
 * Validator для входа пользователя
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim().toLowerCase(),
    password: vine.string().trim(),
  })
)
