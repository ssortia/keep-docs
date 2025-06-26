import type { UISchemaDocument } from '../types';

export interface SchemaParams {
  [key: string]: string | string[] | number | boolean;
}

export const checkAccess = (
  condition: string[] | '*' | { [key: string]: string[] },
  params: SchemaParams,
): boolean => {
  if (condition === '*' || !condition) {
    return true;
  }

  if (Array.isArray(condition)) {
    return condition.length > 0;
  }

  if (typeof condition === 'object' && condition !== null) {
    return Object.entries(condition).every(([paramKey, allowedValues]) => {
      const paramValue = params[paramKey];
      if (paramValue === undefined) {
        return false;
      }

      if (Array.isArray(paramValue)) {
        return paramValue.some((val) => allowedValues.includes(String(val)));
      }

      return allowedValues.includes(String(paramValue));
    });
  }

  return false;
};

export const isDocumentVisible = (document: UISchemaDocument, params: SchemaParams): boolean =>
  checkAccess(document.access?.show, params);

export const isDocumentEditable = (document: UISchemaDocument, params: SchemaParams): boolean =>
  checkAccess(document.access?.editable, params);

export const isDocumentRequired = (document: UISchemaDocument, params: SchemaParams): boolean => {
  if (!document.required) {
    return false;
  }

  return checkAccess(document.required, params);
};

export const getVisibleDocuments = (
  documents: UISchemaDocument[],
  params: SchemaParams,
): UISchemaDocument[] => documents.filter((doc) => isDocumentVisible(doc, params));

export const getEditableDocuments = (
  documents: UISchemaDocument[],
  params: SchemaParams,
): UISchemaDocument[] => documents.filter((doc) => isDocumentEditable(doc, params));
