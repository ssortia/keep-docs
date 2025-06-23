import vine from '@vinejs/vine'

const typeRule = vine
  .string()
  .trim()
  .minLength(1)
  .maxLength(50)
  .regex(/^[a-zA-Z0-9_-]+$/)

const uuidRule = vine.string().uuid()
const pageRule = vine.number().positive().min(1).max(9999)
const documentRule = vine.file({
  size: '50mb',
  extnames: ['pdf', 'jpg', 'jpeg', 'png', 'tiff', 'tif'],
})

export const getDocumentsValidator = vine.compile(
  vine.object({
    uuid: uuidRule,
  })
)

export const getDocumentValidator = vine.compile(
  vine.object({
    uuid: uuidRule,
    type: typeRule,
  })
)

export const addPagesValidator = vine.compile(
  vine.object({
    uuid: uuidRule,
    type: typeRule,
    documents: vine.array(documentRule).minLength(1).maxLength(50),
    name: vine.string().trim().minLength(1).maxLength(100).optional(),
    isNewVersion: vine.boolean().optional(),
  })
)

export const getPageValidator = vine.compile(
  vine.object({
    uuid: uuidRule,
    type: typeRule,
    number: pageRule,
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
    schema: vine.string().trim().minLength(1).maxLength(100),
    uuid: uuidRule.optional(),
  })
)
