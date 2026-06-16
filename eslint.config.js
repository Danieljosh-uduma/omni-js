export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      'docs/omni-runtime.js',
      'packages/runtime/dist/**'
    ]
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        Node: 'readonly',
        MutationObserver: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        location: 'readonly',
        history: 'readonly',
        DOMParser: 'readonly',
        // Node globals (for CLI build tools)
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      'no-console': 'off',
      'no-empty': 'warn',
      'no-undef': 'error'
    }
  }
];
