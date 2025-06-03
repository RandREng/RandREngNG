import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'msal',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'msal',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },
];

// import { FlatCompat } from '@eslint/eslintrc';
// import { dirname } from 'path';
// import { fileURLToPath } from 'url';
// import js from '@eslint/js';
// import baseConfig from '../../eslint.config.mjs';

// const compat = new FlatCompat({
//   baseDirectory: dirname(fileURLToPath(import.meta.url)),
//   recommendedConfig: js.configs.recommended,
// });

// export default [
//   {
//     ignores: ['**/dist'],
//   },
//   ...baseConfig,
//   ...compat
//     .config({
//       extends: [
//         'plugin:@nx/angular',
//         'plugin:@angular-eslint/template/process-inline-templates',
//       ],
//     })
//     .map((config) => ({
//       ...config,
//       files: ['**/*.ts'],
//       rules: {
//         ...config.rules,
//         '@angular-eslint/directive-selector': [
//           'error',
//           {
//             type: 'attribute',
//             prefix: 'masl',
//             style: 'camelCase',
//           },
//         ],
//         '@angular-eslint/component-selector': [
//           'error',
//           {
//             type: 'element',
//             prefix: 'msal',
//             style: 'kebab-case',
//           },
//         ],
//         '@angular-eslint/prefer-standalone': 'off',
//       },
//     })),
//   ...compat
//     .config({
//       extends: ['plugin:@nx/angular-template'],
//     })
//     .map((config) => ({
//       ...config,
//       files: ['**/*.html'],
//       rules: {
//         ...config.rules,
//       },
//     })),
//   {
//     files: ['**/*.json'],
//     rules: {
//       '@nx/dependency-checks': 'error',
//     },
//     languageOptions: {
//       parser: await import('jsonc-eslint-parser'),
//     },
//   },
// ];
