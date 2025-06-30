export default {
  documents: [
    {
      type: 'passport',
      name: 'Паспорт',
      required: {
        statusCode: ['CREATION'],
      },
      access: {
        show: '*',
        editable: {
          statusCode: ['CREATION', 'CREATED', 'CONTINUE_QUESTIONNAIRE'],
        },
      },
    },
    {
      type: 'buyerQuestionnaire',
      name: 'Анкета',
      accept: [
        'image/*',
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.oasis.opendocument.text',
        'application/zip',
        'application/x-tika-ooxml',
        'application/x-tika-msoffice',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.oasis.opendocument.spreadsheet',
      ],
    },
    {
      name: 'Прочее',
      type: 'otherDocuments',
    },
  ],
}
