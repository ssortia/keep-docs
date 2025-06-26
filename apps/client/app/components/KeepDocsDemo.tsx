'use client';

import { KeepDocs } from '@keep-docs/ui';

export default function KeepDocsDemo() {
  const config = {
    baseUrl: 'http://localhost:3333/api/proxy',
    schema: 'strizh_offer',
  };

  const params = {
    statusCode: 'CREATION',
    userType: 'INDIVIDUAL',
  };

  const uuid = '550e8400-e29b-41d4-a716-446655440000';

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Демо Keep Docs UI</h2>
      <KeepDocs
        config={config}
        uuid={uuid}
        params={params}
        onError={(docs) => console.log(docs, "onError")}
        onInit={(docs) => console.log(docs, "onInit")}
        onUpdate={(docs) => console.log(docs, "onUpdate")}
        onRemove={(docs) => console.log(docs, "onRemove")}
      />
    </div>
  );
}
