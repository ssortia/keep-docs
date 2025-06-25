export interface UISchemaDocument {
  type: string;
  name: string;
  required?: string[] | '*' | { [key: string]: string[] };
  access: {
    show: string[] | '*' | { [key: string]: string[] };
    editable: string[] | '*' | { [key: string]: string[] };
  };
  accept?: string[];
}

export interface UISchema {
  documents: UISchemaDocument[];
}

export const exampleUISchema: UISchema = {
  documents: [
    {
      type: 'passport',
      name: 'Паспорт',
      required: {
        statusCode: ['CREATION', 'CREATED', 'ON_CHECK', 'CONTINUE_QUESTIONNAIRE'],
      },
      access: {
        show: '*',
        editable: {
          statusCode: ['CREATION', 'CREATED', 'CONTINUE_QUESTIONNAIRE'],
        },
      },
      accept: ['image/*', 'application/pdf'],
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
        editable: {
          statusCode: ['CREATION', 'CREATED', 'CONTINUE_QUESTIONNAIRE'],
        },
      },
    },
    {
      type: 'inn',
      name: 'ИНН',
      required: '*',
      access: {
        show: {
          userType: ['INDIVIDUAL', 'ENTREPRENEUR'],
        },
        editable: {
          statusCode: ['CREATION', 'CREATED'],
          userType: ['INDIVIDUAL', 'ENTREPRENEUR'],
        },
      },
      accept: ['image/*', 'application/pdf'],
    },
    {
      type: 'snils',
      name: 'СНИЛС',
      access: {
        show: '*',
        editable: {
          statusCode: ['CREATION', 'CREATED'],
        },
      },
      accept: ['image/*', 'application/pdf'],
    },
  ],
};
