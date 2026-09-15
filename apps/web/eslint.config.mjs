import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  { ignores: ['.next/**', '.contentlayer/**', 'node_modules/**'] },
  ...nextVitals,
  {
    rules: {
      // React Compiler rules (new in eslint-config-next 16) flag ~20 pre-existing effects.
      // ponytail: warn for now; fix per file when touching it.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
];

export default config;
