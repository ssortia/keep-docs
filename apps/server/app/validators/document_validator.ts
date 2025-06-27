import vine from '@vinejs/vine'
import { SchemaValidator } from './schema_validator.js'

const typeRule = vine
  .string()
  .trim()
  .minLength(1)
  .maxLength(50)
  .regex(/^[a-zA-Z0-9_-]+$/)

const uuidRule = vine.string().uuid()
const pageRule = vine.number().positive().min(1).max(9999)
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

export const getSchemaValidator = vine.compile(
  vine.object({
    schema: schemaNameRule,
  })
)

/**
 * Создает валидатор для addPages с учетом разрешенных типов файлов из схемы
 */
export async function createAddPagesValidator(schemaName: string, documentType: string) {
  const allowedExtensions = await SchemaValidator.getAllowedExtensions(schemaName, documentType)
  console.log('Разрешенные расширения для', schemaName, documentType, ':', allowedExtensions)

  const schemaBasedDocumentRule = vine.file({
    size: '50mb',
    extnames: allowedExtensions,
  })

  return vine.compile(
    vine.object({
      uuid: uuidRule,
      type: typeRule,
      documents: vine.array(schemaBasedDocumentRule).minLength(1).maxLength(50),
      name: vine.string().trim().minLength(1).maxLength(100).optional(),
      isNewVersion: vine.boolean().optional(),
    })
  )
}
