export default {
  settings: {
    naming: {
      enabled: true,
    },
    download: {
      enabled: true,
    },
    versions: {
      enabled: true,
    },
  },
  blocks: [
    {
      type: 'unknownBlock',
    },
    {
      name: 'Создание заявки',
      type: 'offerCreateBlock',
      open: [
        'CREATION',
        'CREATED',
        'ON_CHECK',
        'REJECT',
        'CONTINUE_QUESTIONNAIRE',
        'CLIENT_VERIFICATION',
      ],
      collapsed: true,
    },
    {
      type: 'otherBlock',
    },
  ],
  documents: [
    {
      type: 'passport',
      block: 'offerCreateBlock',
      name: 'Паспорт',
      required: ['CREATION', 'CREATED', 'ON_CHECK', 'CONTINUE_QUESTIONNAIRE'],
      access: {
        show: '*',
        editable: ['CREATION', 'CREATED', 'CONTINUE_QUESTIONNAIRE'],
      },
    },
    {
      type: 'buyerQuestionnaire',
      block: 'offerCreateBlock',
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
    {
      block: 'otherBlock',
      name: 'Прочее',
      tooltip: 'Документы, которые распознались, но не могут быть загружены в необходимую вкладку',
      type: 'otherDocuments',
      access: {
        show: '*',
        editable: '*',
      },
    },
  ],
}
