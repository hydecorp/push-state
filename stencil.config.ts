import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'hy-push-state',
  minifyJs: false,
  outputTargets: [
    { type: 'dist' },
    { type: 'www' },
    { type: 'docs' },
  ],
  // rollupConfig: {
  //   inputOptions: {
  //     //@ts-ignore: fuuuuu
  //     // external: (id, parent, resolved) => {
  //     //   return /rxjs/.test(id) || /rxjs/.test(parent);
  //     // },
  //   },
  // },
};
