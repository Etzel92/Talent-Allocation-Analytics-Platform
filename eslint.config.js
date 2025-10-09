// /.eslint.config.js (raíz)
import webConfig from './web/eslint.config.js';

export default [
  // No linttear este archivo de la raíz
  { ignores: ['eslint.config.js'] },
  // Reusar la config del frontend
  ...webConfig,
];
