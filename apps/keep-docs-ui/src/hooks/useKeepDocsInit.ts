import { useEffect, useRef } from 'react';
import { getVisibleDocuments, type SchemaParams } from '../utils/schemaUtils';
import { useKeepDocsContext } from '../contexts/KeepDocsContext';
import { useDocumentManager } from './useDocumentManager';
import type { Dossier, UISchema } from '../types';

interface UseKeepDocsInitProps {
  defaultTab?: string;
  params: SchemaParams;
  onInit?: (dossier: Dossier) => void;
  onError?: (error: string) => void;
  updateDossier: (dossier: Dossier) => void;
  updateSchema: (schema: UISchema) => void;
  setActiveTab: (tab: string) => void;
}

export function useKeepDocsInit({
  defaultTab,
  params,
  onInit,
  onError,
  updateDossier,
  updateSchema,
  setActiveTab,
}: UseKeepDocsInitProps) {
  const { uuid, config } = useKeepDocsContext();
  const { getDossier, getSchema } = useDocumentManager();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current || !uuid || !config.schema) {
      return;
    }

    const initComponent = async () => {
      try {
        isInitialized.current = true;

        const [schemaData, dossierData] = await Promise.all([getSchema(), getDossier(uuid)]);

        if (schemaData) {
          updateSchema(schemaData);
        }

        if (dossierData) {
          updateDossier(dossierData);
          onInit?.(dossierData);
        }

        if (schemaData?.documents) {
          const visibleDocs = getVisibleDocuments(schemaData.documents, params);
          if (defaultTab && visibleDocs.find((doc) => doc.type === defaultTab)) {
            setActiveTab(defaultTab);
          } else if (visibleDocs.length > 0) {
            setActiveTab(visibleDocs[0].type);
          }
        }
      } catch (err) {
        isInitialized.current = false;
        const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки данных';
        onError?.(errorMessage);
      }
    };

    initComponent().catch(console.log);
  }, [
    uuid,
    config.schema,
    defaultTab,
    params,
    getDossier,
    getSchema,
    onInit,
    onError,
    updateDossier,
    updateSchema,
    setActiveTab,
  ]);
}
