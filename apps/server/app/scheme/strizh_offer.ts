export default {
  documents: [
    {
      type: 'passport',
      name: 'Паспорт',
      required: ['CREATION', 'CREATED', 'ON_CHECK', 'CONTINUE_QUESTIONNAIRE'],
      access: {
        show: '*',
        editable: ['CREATION', 'CREATED', 'CONTINUE_QUESTIONNAIRE'],
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
      access: {
        show: '*',
        editable: ['CREATION', 'CREATED', 'CONTINUE_QUESTIONNAIRE'],
      },
    },
  ],
}
