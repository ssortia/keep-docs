import vine from '@vinejs/vine'

const typeRule = vine
  .string()
  .trim()
  .minLength(1)
  .maxLength(50)
  .regex(/^[a-zA-Z0-9_-]+$/)

const uuidRule = vine.string().uuid()
const schemaNameRule = vine
  .string()
  .trim()
  .minLength(1)
  .maxLength(100)
  .regex(/^[a-zA-Z0-9_-]+$/)
  .optional()

export const getDocumentsValidator = vine.compile(
  vine.object({
    uuid: uuidRule,
    schema: schemaNameRule,
  })
)

export const getDocumentValidator = vine.compile(
  vine.object({
    uuid: uuidRule,
    type: typeRule,
  })
)

export const getPageValidator = vine.compile(
  vine.object({
    uuid: uuidRule,
    type: typeRule,
    pageUuid: uuidRule,
  })
)

export const deletePageValidator = vine.compile(
  vine.object({
    uuid: uuidRule,
    type: typeRule,
    pageUuid: uuidRule,
  })
)

export const createDossierValidator = vine.compile(
  vine.object({
    schema: schemaNameRule,
    uuid: uuidRule.optional(),
  })
)

export const changeCurrentVersionValidator = vine.compile(
  vine.object({
    uuid: uuidRule,
    type: typeRule,
    versionId: vine.number().positive(),
  })
)

export const updateVersionNameValidator = vine.compile(
  vine.object({
    uuid: uuidRule,
    type: typeRule,
    versionId: vine.number().positive(),
    name: vine.string().trim().minLength(1).maxLength(100),
  })
)

export const getSchemaValidator = vine.compile(
  vine.object({
    schema: schemaNameRule,
  })
)

/**
 * Простой валидатор для addPages без бизнес-логики расширений
 */
export const addPagesValidator = vine.compile(
  vine.object({
    uuid: uuidRule,
    type: typeRule,
    documents: vine
      .array(vine.file({ size: '50mb' }))
      .minLength(1)
      .maxLength(50),
    name: vine.string().trim().minLength(1).maxLength(100).optional(),
    isNewVersion: vine.boolean().optional(),
  })
)
