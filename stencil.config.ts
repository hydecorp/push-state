import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'hy-push-state',
  outputTargets: [
    { type: 'dist' },
    { type: 'docs' },
    // { type: 'www' },
  ],
};