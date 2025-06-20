import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(100),
    email: vine.string().email().trim().toLowerCase(),
    password: vine.string().minLength(6).trim().optional(),
    roleId: vine.number().positive().optional(),
    blocked: vine.boolean().optional(),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(100).optional(),
    email: vine.string().email().trim().toLowerCase().optional(),
    roleId: vine.number().positive().optional(),
    blocked: vine.boolean().optional(),
  })
)
