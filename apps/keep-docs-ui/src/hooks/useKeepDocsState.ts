import { useCallback, useState } from 'react';
import type { Document, Dossier, UISchema } from '../types';

export function useKeepDocsState() {
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [schema, setSchema] = useState<UISchema | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [accordionOpen, setAccordionOpen] = useState(false);

  const updateDossier = useCallback((newDossier: Dossier) => {
    setDossier(newDossier);
  }, []);

  const updateSchema = useCallback((newSchema: UISchema) => {
    setSchema(newSchema);
  }, []);

  const setActiveTabWithCheck = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const toggleAccordion = useCallback(() => {
    setAccordionOpen((prev) => !prev);
  }, []);

  const getCurrentDocument = useCallback((): Document | undefined => {
    return dossier?.documents.find((doc) => doc.code === activeTab);
  }, [dossier, activeTab]);

  return {
    dossier,
    schema,
    activeTab,
    accordionOpen,
    updateDossier,
    updateSchema,
    setActiveTab: setActiveTabWithCheck,
    toggleAccordion,
    getCurrentDocument,
  };
}
