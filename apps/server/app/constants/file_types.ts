export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'tiff', 'tif', 'gif', 'bmp', 'webp']

export const MERGEABLE_EXTENSIONS = [
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'tiff',
  'tif',
  'gif',
  'bmp',
  'webp',
]

export const DOCUMENT_EXTENSIONS = ['xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx', 'odt', 'ods']

export const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  gif: 'image/gif',
  bmp: 'image/bmp',
  webp: 'image/webp',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  zip: 'application/zip',
}

export const PDF_PAGE_SIZE = {
  A4_WIDTH: 595.28,
  A4_HEIGHT: 841.89,
}

export const IMAGE_PROCESSING = {
  JPEG_QUALITY: 100,
  PDF_DENSITY: 300,
  MAX_WIDTH: 2480,
  MAX_HEIGHT: 3508,
}
