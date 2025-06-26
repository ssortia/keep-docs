export default {
  documents: [
    {
      type: 'passport',
      name: 'Паспорт гражданина РФ',
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
      type: 'inn',
      name: 'ИНН',
    },
    {
      type: 'fns_screenshot',
      name: 'Скриншот данных из ФНС',
    },
    {
      type: 'snils',
      name: 'СНИЛС',
    },
    {
      type: 'questionnaires',
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
    },
    {
      type: 'qual_exclude_statement',
      name: 'Заявление об исключении из реестра квалифицированных инвесторов',
    },
    {
      type: 'other',
      name: 'Прочее',
    },

    {
      type: 'head_passport',
      name: 'Паспорт гражданина РФ',
    },
    {
      type: 'head_questionnaires',
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
    },
    {
      type: 'head_snils',
      name: 'СНИЛС',
    },
    {
      type: 'head_other',
      name: 'Прочее',
    },
  ],
}
