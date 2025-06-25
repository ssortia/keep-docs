export default {
  documents: [
    {
      type: 'passport',
      name: 'Паспорт гражданина РФ',
      required: ['CREATION'],
      access: {
        show: '*',
        editable: ['CREATION', 'CREATED', 'CONTINUE_QUESTIONNAIRE'],
      },
    },
    {
      type: 'inn',
      name: 'ИНН',
      required: ['CREATION'],
      access: {
        show: '*',
        editable: ['CREATION', 'CREATED', 'CONTINUE_QUESTIONNAIRE'],
      },
    },
    {
      type: 'fns_screenshot',
      name: 'Скриншот данных из ФНС',
      required: ['CREATION'],
      access: {
        show: '*',
        editable: ['CREATION', 'CREATED', 'CONTINUE_QUESTIONNAIRE'],
      },
    },
    {
      type: 'snils',
      name: 'СНИЛС',
      required: ['CREATION'],
      access: {
        show: '*',
        editable: ['CREATION', 'CREATED', 'CONTINUE_QUESTIONNAIRE'],
      },
    },
    {
      type: 'buyerQuestionnaire',
      name: 'Анкеты',
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
      type: 'qual_statement',
      name: 'Заявление о признании квалифицированным инвестором',
      required: ['CREATION'],
      access: {
        show: '*',
        editable: ['CREATION', 'CREATED', 'CONTINUE_QUESTIONNAIRE'],
      },
    },
    {
      type: 'qual_exclude_statement',
      name: 'Заявление об исключении из реестра квалифицированных инвесторов',
      required: ['CREATION'],
      access: {
        show: '*',
        editable: ['CREATION', 'CREATED', 'CONTINUE_QUESTIONNAIRE'],
      },
    },
    {
      type: 'other',
      name: 'Прочее',
      access: {
        show: '*',
        editable: ['CREATION', 'CREATED', 'CONTINUE_QUESTIONNAIRE'],
      },
    },
  ],
}
