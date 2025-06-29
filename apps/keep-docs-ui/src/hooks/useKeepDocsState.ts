import { useCallback, useState } from "react";
import type { Document, Dossier, UISchema } from "../types";

export function useKeepDocsState() {
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [schema, setSchema] = useState<UISchema | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [viewVersions, setViewVersions] = useState<Record<string, number>>({});

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

  const getViewVersion = useCallback((documentCode: string): number | undefined => {
    return viewVersions[documentCode];
  }, [viewVersions]);

  const setViewVersion = useCallback((documentCode: string, versionId: number) => {
    setViewVersions(prev => ({
      ...prev,
      [documentCode]: versionId
    }));
  }, []);

  const clearViewVersion = useCallback((documentCode: string) => {
    setViewVersions(prev => {
      const { [documentCode]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const getDocumentForView = useCallback((): Document | undefined => {
    const document = getCurrentDocument();
    if (!document) return undefined;

    const viewVersionId = viewVersions[document.code];
    if (!viewVersionId) return document;

    const viewVersion = document.versions.find(v => v.id === viewVersionId);
    if (!viewVersion) return document;

    return {
      ...document,
      currentVersion: viewVersion,
      files: viewVersion.files,
      filesCount: viewVersion.files.length
    };
  }, [getCurrentDocument, viewVersions]);

  return {
    dossier,
    schema,
    activeTab,
    accordionOpen,
    viewVersions,
    updateDossier,
    updateSchema,
    setActiveTab: setActiveTabWithCheck,
    toggleAccordion,
    getCurrentDocument,
    getViewVersion,
    setViewVersion,
    clearViewVersion,
    getDocumentForView
  };
}
