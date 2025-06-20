import vine from '@vinejs/vine'

export const uploadDocumentValidator = vine.compile(
  vine.object({
    documents: vine
      .array(
        vine.file({
          size: '50mb',
          extnames: ['pdf', 'jpg', 'jpeg', 'png', 'tiff', 'tif'],
        })
      )
      .minLength(1)
      .maxLength(50),
    name: vine.string().trim().minLength(1).maxLength(100).optional(),
    isNewVersion: vine.boolean().optional(),
  })
)

export const dossierUuidValidator = vine.compile(
  vine.object({
    uuid: vine.string().uuid(),
  })
)

export const documentTypeValidator = vine.compile(
  vine.object({
    type: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(50)
      .regex(/^[a-zA-Z0-9_-]+$/),
  })
)

export const pageNumberValidator = vine.compile(
  vine.object({
    number: vine.number().positive().min(1).max(9999),
  })
)

export const pageUuidValidator = vine.compile(
  vine.object({
    pageUuid: vine.string().uuid(),
  })
)
