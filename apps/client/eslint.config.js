const rootConfig = require('../../.eslintrc.js');

// Create a copy of the root config with client-specific overrides
const clientConfig = { 
  ...rootConfig,
  overrides: [
    ...(rootConfig.overrides || []),
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      rules: {
        // Next.js specific overrides for client app
        'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],
        'import/extensions': 'off',
        'jsx-a11y/anchor-is-valid': 'off', // Next.js uses its own Link component
        'react/jsx-props-no-spreading': 'off',
        'react/require-default-props': 'off',
      },
    },
  ],
};

module.exports = clientConfig;