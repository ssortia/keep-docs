import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type { DocumentManagerConfig, DocumentUploadResponse, Dossier, UISchema } from '../types';

export class DocumentApiClient {
  private api: AxiosInstance;

  private config: DocumentManagerConfig;

  constructor(config: DocumentManagerConfig) {
    this.config = config;
    this.api = axios.create({
      baseURL: `${config.baseUrl}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getDossier(uuid: string): Promise<Dossier> {
    const response: AxiosResponse<Dossier> = await this.api.get(
      `/dossiers/${uuid}?schema=${this.config.schema}`,
    );

    return response.data;
  }

  async uploadDocument(
    uuid: string,
    documentType: string,
    files: File[],
    versionName?: string,
    isNewVersion: boolean = false,
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('documents', file);
    });

    if (versionName) {
      formData.append('name', versionName);
    }

    formData.append('isNewVersion', isNewVersion.toString());

    const response: AxiosResponse<DocumentUploadResponse> = await this.api.put(
      `/dossiers/${uuid}/documents/${documentType}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data;
  }

  async downloadDocument(uuid: string, documentType: string): Promise<Blob> {
    const response = await this.api.get(`/dossiers/${uuid}/documents/${documentType}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async downloadPage(uuid: string, documentType: string, pageUuid: string): Promise<Blob> {
    const response = await this.api.get(
      `/dossiers/${uuid}/documents/${documentType}/pages/${pageUuid}`,
      {
        responseType: 'blob',
      },
    );
    return response.data;
  }

  async deletePage(uuid: string, documentType: string, pageUuid: string): Promise<void> {
    await this.api.delete(`/dossiers/${uuid}/documents/${documentType}/pages/${pageUuid}`);
  }

  async changeCurrentVersion(uuid: string, documentType: string, versionId: number): Promise<void> {
    await this.api.patch(`/dossiers/${uuid}/documents/${documentType}/version`, {
      versionId,
    });
  }

  async deleteVersion(uuid: string, documentType: string, versionId: number): Promise<void> {
    await this.api.delete(`/dossiers/${uuid}/documents/${documentType}/versions/${versionId}`);
  }

  async createVersion(
    uuid: string,
    documentType: string,
    name: string,
  ): Promise<void> {
    await this.api.post(`/dossiers/${uuid}/documents/${documentType}/versions`, {
      name,
    });
  }

  async updateVersionName(
    uuid: string,
    documentType: string,
    versionId: number,
    name: string,
  ): Promise<void> {
    await this.api.patch(`/dossiers/${uuid}/documents/${documentType}/versions/${versionId}`, {
      name,
    });
  }

  async getSchema(): Promise<UISchema> {
    const response = await this.api.get(`/schemas/${this.config.schema}`);
    return response.data.schema;
  }
}
