import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'hy-drawer',
  outputTargets: [
    { type: 'dist' },
    { type: 'docs' },
    // { type: 'www' },
  ],
};