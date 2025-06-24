'use client';

import { KeepDocs, exampleUISchema } from '@keep-docs/ui';

export default function KeepDocsDemo() {
  const config = {
    baseUrl: 'http://localhost:3333/api/docs',
    schema: 'strizh_offer'
  };

  const params = {
    statusCode: 'CREATION',
    userType: 'INDIVIDUAL'
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Демо Keep Docs UI</h2>
      <KeepDocs
        config={config}
        schema={exampleUISchema}
        uuid="550e8400-e29b-41d4-a716-446655440000"
        defaultTab="passport"
        params={params}
        onError={console.log}
        onInit={console.log}
        onUpdate={console.log}
        onRemove={console.log}
      />
    </div>
  );
}