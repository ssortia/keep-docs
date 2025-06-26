import { useEffect, useRef } from 'react';
import { getVisibleDocuments, type SchemaParams } from '../utils/schemaUtils';
import type { DocumentManagerConfig, Dossier, UISchema } from '../types';

interface UseKeepDocsInitProps {
  uuid: string;
  config: DocumentManagerConfig;
  defaultTab?: string;
  params: SchemaParams;
  onInit?: (dossier: Dossier) => void;
  onError?: (error: string) => void;
  getDossier: (uuid: string) => Promise<Dossier | null>;
  getSchema: () => Promise<UISchema | null>;
  updateDossier: (dossier: Dossier) => void;
  updateSchema: (schema: UISchema) => void;
  setActiveTab: (tab: string) => void;
}

export function useKeepDocsInit({
  uuid,
  config,
  defaultTab,
  params,
  onInit,
  onError,
  getDossier,
  getSchema,
  updateDossier,
  updateSchema,
  setActiveTab,
}: UseKeepDocsInitProps) {
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
